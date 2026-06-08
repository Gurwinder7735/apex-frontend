"use client";

import { Button, Modal, Select, Space, Switch, Tag, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { User } from "@/types/models/User";

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

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchUsersRequest({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  const handleEditRoles = useCallback((user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
    setRoleModalOpen(true);
  }, []);

  const handleSaveRoles = useCallback(() => {
    if (editingUser) {
      dispatch(updateUserRolesRequest({ userId: editingUser.id, roles: selectedRoles }));
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
        title: "Active",
        dataIndex: "isActive",
        width: 80,
        render: (active: boolean) => <Switch checked={active} disabled size="small" />,
      },
      {
        title: "Actions",
        width: 180,
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
    [handleEditRoles, handleDelete],
  );

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage users and assign roles." />
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
        title={`Edit Roles — ${editingUser?.name || editingUser?.email || ""}`}
        open={roleModalOpen}
        onOk={handleSaveRoles}
        onCancel={() => {
          setRoleModalOpen(false);
          setEditingUser(null);
        }}
      >
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          value={selectedRoles}
          onChange={setSelectedRoles}
          options={ROLE_OPTIONS}
          placeholder="Select roles"
        />
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
