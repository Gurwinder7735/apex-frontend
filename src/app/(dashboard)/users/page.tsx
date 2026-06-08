"use client";

import { Button, Modal, Select, Space, Switch, Tag, Typography, Form, Input as AntInput, notification } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { DataTable } from "@/components/common/Table/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminGuard } from "@/components/common/RouteGuard/AdminGuard";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  deleteUserRequest,
  fetchUsersRequest,
  updateUserRolesRequest,
} from "@/store/modules/user/userSlice";
import { selectUsers, selectUsersMeta } from "@/store/modules/user/userSelectors";
import { fetchRolesRequest } from "@/store/modules/roles/rolesSlice";
import { selectRoles } from "@/store/modules/roles/rolesSelectors";
import type { User } from "@/types/models/User";
import { apiRequest } from "@/lib/api/axiosInstance";

const ROLE_OPTIONS = [
  { label: "User", value: "user" },
  { label: "Admin", value: "admin" },
];

function RoleBadge({ roles }: { roles: string[] }) {
  return (
    <Space size={4}>
      {roles.map((role) => (
        <Tag key={role} color={role === "admin" ? "red" : "blue"}>
          {role}
        </Tag>
      ))}
    </Space>
  );
}

function UsersManagement() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const meta = useAppSelector(selectUsersMeta);
  const roles = useAppSelector(selectRoles);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchUsersRequest({ page: 1, pageSize: 100 }));
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  const roleOptions = useMemo(
    () => roles.map((r) => ({ label: r.name, value: r.id })),
    [roles],
  );

  const getRoleName = useCallback(
    (roleId?: string | null) => roles.find((r) => r.id === roleId)?.name || "—",
    [roles],
  );

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      await apiRequest({
        url: "/api/v1/users",
        method: "POST",
        data: values,
      });
      notification.success({ message: "User created" });
      setCreateModalOpen(false);
      createForm.resetFields();
      dispatch(fetchUsersRequest({ page: 1, pageSize: 100 }));
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      notification.error({ message: "Failed to create user" });
    }
  };

  const handleEditRoles = useCallback((user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
    setRoleModalOpen(true);
  }, []);

  const handleSaveRoles = useCallback(async () => {
    if (editingUser) {
      dispatch(updateUserRolesRequest({ userId: editingUser.id, roles: selectedRoles }));
      try {
        await apiRequest({
          url: `/api/v1/users/${editingUser.id}`,
          method: "PUT",
          data: { roleId: editingUser.roleId || null },
        });
      } catch {
        // role save is best-effort
      }
      setRoleModalOpen(false);
      setEditingUser(null);
    }
  }, [editingUser, selectedRoles, dispatch]);

  const handleDelete = useCallback(
    (userId: string) => {
      Modal.confirm({
        title: "Delete user?",
        content: "This action cannot be undone.",
        okText: "Delete",
        okButtonProps: { danger: true },
        onOk: () => dispatch(deleteUserRequest(userId)),
      });
    },
    [dispatch],
  );

  const columns: ColumnsType<User> = useMemo(
    () => [
      { title: "Name", dataIndex: "name", width: 180 },
      { title: "Email", dataIndex: "email", width: 240 },
      {
        title: "Roles",
        dataIndex: "roles",
        width: 160,
        render: (roles: string[]) => <RoleBadge roles={roles} />,
      },
      {
        title: "Role",
        dataIndex: "roleId",
        width: 140,
        render: (roleId?: string | null) => (
          <Typography.Text className="text-sm text-zinc-500">{getRoleName(roleId)}</Typography.Text>
        ),
      },
      {
        title: "Active",
        dataIndex: "isActive",
        width: 80,
        render: (active: boolean) => <Switch checked={active} disabled size="small" />,
      },
      {
        title: "Actions",
        width: 220,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => handleEditRoles(row)}>
              Edit Roles
            </Button>
            <Button size="small" danger onClick={() => handleDelete(row.id)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    [handleEditRoles, handleDelete, getRoleName],
  );

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage users and assign roles." />

      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setCreateModalOpen(true)}>
          Create User
        </Button>
      </div>

      <DataTable<User>
        rowKey="id"
        columns={columns}
        loading={meta.isLoading}
        dataSource={users}
        pagination={{
          current: meta.page,
          pageSize: meta.pageSize,
          total: meta.total,
          onChange: (page, pageSize) =>
            dispatch(fetchUsersRequest({ page, pageSize })),
        }}
      />

      <Modal
        title="Create User"
        open={createModalOpen}
        onOk={handleCreateUser}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="Full name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Required" }, { type: "email", message: "Invalid email" }]}>
            <AntInput placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Required" }, { min: 8, message: "Min 8 characters" }]}>
            <AntInput.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="roleId" label="Role">
            <Select
              allowClear
              placeholder="Select role"
              options={roleOptions}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Edit Roles — ${editingUser?.name || editingUser?.email || ""}`}
        open={roleModalOpen}
        onOk={handleSaveRoles}
        onCancel={() => {
          setRoleModalOpen(false);
          setEditingUser(null);
        }}
      >
        <Space direction="vertical" className="w-full">
          <Typography.Text strong>System Roles</Typography.Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            value={selectedRoles}
            onChange={setSelectedRoles}
            options={ROLE_OPTIONS}
            placeholder="Select roles"
          />
          <Typography.Text strong className="mt-3">Assigned Role</Typography.Text>
          {editingUser && (
            <Select
              style={{ width: "100%" }}
              value={editingUser.roleId || undefined}
              onChange={(val) => {
                setEditingUser({ ...editingUser, roleId: val ?? null });
              }}
              options={roleOptions}
              allowClear
              placeholder="Select a role"
            />
          )}
        </Space>
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersManagement />
    </AdminGuard>
  );
}
