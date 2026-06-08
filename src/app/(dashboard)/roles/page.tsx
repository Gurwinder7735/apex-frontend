"use client";

import { useEffect, useState } from "react";
import { Button, Table, Tag, Card, Space, Typography, Modal, Form, Input as AntInput, Drawer, Checkbox, App, Empty } from "antd";
import { Plus, Edit3, Trash2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminGuard } from "@/components/common/RouteGuard/AdminGuard";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { fetchRolesRequest, createRoleRequest, updateRoleRequest, deleteRoleRequest } from "@/store/modules/roles/rolesSlice";
import { selectRoles, selectRolesMeta } from "@/store/modules/roles/rolesSelectors";
import type { Role } from "@/store/modules/roles/rolesTypes";
import type { ModulePermission } from "@/types/models/User";
import { MODULE_OPTIONS, ACTION_OPTIONS } from "@/store/modules/roles/rolesTypes";

function RolesPageInner() {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const meta = useAppSelector(selectRolesMeta);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ name: "", description: "", permissions: [] });
    setDrawerOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions.flatMap((p) =>
        [
          p.canView && `${p.module}:view`,
          p.canCreate && `${p.module}:create`,
          p.canEdit && `${p.module}:edit`,
          p.canDelete && `${p.module}:delete`,
        ].filter(Boolean),
      ),
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const checkedEntries: string[] = values.permissions || [];

      const permMap: Record<string, ModulePermission> = {};
      for (const moduleOpt of MODULE_OPTIONS) {
        permMap[moduleOpt.value] = {
          module: moduleOpt.value,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        };
      }
      for (const entry of checkedEntries) {
        const [mod, action] = entry.split(":");
        if (permMap[mod]) {
          const field = `can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ModulePermission;
          (permMap[mod] as any)[field] = true;
        }
      }

      const payload = {
        name: values.name,
        description: values.description,
        permissions: Object.values(permMap).filter((p) => p.canView || p.canCreate || p.canEdit || p.canDelete),
      };

      if (editingRole) {
        dispatch(updateRoleRequest({ id: editingRole.id, data: payload }));
      } else {
        dispatch(createRoleRequest(payload));
      }
      setDrawerOpen(false);
      setEditingRole(null);
    } catch {
      // validation failed
    }
  };

  const handleDelete = (role: Role) => {
    Modal.confirm({
      title: "Delete role",
      content: `Are you sure you want to delete "${role.name}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () => dispatch(deleteRoleRequest(role.id)),
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => <Typography.Text className="text-zinc-500">{desc || "—"}</Typography.Text>,
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_: unknown, record: Role) => (
        <Space wrap size={[4, 4]}>
          {record.permissions.length === 0 && <Typography.Text className="text-zinc-400 text-xs">None</Typography.Text>}
          {record.permissions.map((p) => {
            const actions = [];
            if (p.canView) actions.push("V");
            if (p.canCreate) actions.push("C");
            if (p.canEdit) actions.push("E");
            if (p.canDelete) actions.push("D");
            return (
              <Tag key={p.module} className="!rounded !text-[10px] !px-1.5">
                {p.module}: {actions.join(",")}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Role) => (
        <Space>
          <Button type="text" icon={<Edit3 className="w-4 h-4" />} onClick={() => handleOpenEdit(record)} />
          <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Role Management" subtitle="Define roles and assign module-level permissions to control access." />

      <div className="mb-4 flex items-center justify-between">
        <div />
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Create Role
        </Button>
      </div>

      <Card className="!rounded-xl !border-zinc-200 !shadow-sm !overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={meta.isLoading}
          pagination={false}
        />
      </Card>

      <Drawer
        title={editingRole ? "Edit Role" : "Create Role"}
        width={560}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingRole(null); }}
        footer={
          <Space className="w-full justify-end">
            <Button onClick={() => { setDrawerOpen(false); setEditingRole(null); }}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>{editingRole ? "Save" : "Create"}</Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Role Name" rules={[{ required: true, message: "Required" }]}>
            <AntInput placeholder="e.g. Sales Manager" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <AntInput placeholder="Brief description of this role" />
          </Form.Item>
          <Form.Item name="permissions" label="Module Permissions">
            <Checkbox.Group className="w-full">
              <div className="border border-zinc-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_repeat(4,64px)] gap-px bg-zinc-200">
                  <div className="bg-zinc-50 p-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Module</div>
                  {ACTION_OPTIONS.map((a) => (
                    <div key={a.value} className="bg-zinc-50 p-2 text-xs font-medium text-zinc-500 uppercase tracking-wider text-center">
                      {a.label}
                    </div>
                  ))}
                  {MODULE_OPTIONS.map((m) => (
                    <div key={m.value} className="contents">
                      <div className="bg-white p-2 text-sm text-zinc-700">{m.label}</div>
                      {ACTION_OPTIONS.map((a) => (
                        <div key={`${m.value}:${a.value}`} className="bg-white p-2 flex items-center justify-center">
                          <Checkbox value={`${m.value}:${a.value}`} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default function RolesPage() {
  return (
    <AdminGuard>
      <RolesPageInner />
    </AdminGuard>
  );
}
