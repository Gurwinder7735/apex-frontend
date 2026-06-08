export interface ModulePermission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  roleId?: string | null;
  isActive: boolean;
  permissions?: ModulePermission[];
}
