import { UserRole } from './auth';

export interface RolePermissions {
  canManageUsers: boolean;
  canManageMasterData: boolean;
  canCreateRequirements: boolean;
  canCreateDataRequests: boolean;
  canVerifySubmissions: boolean;
  canSubmitDepartmentData: boolean;
  canManageDepartmentActivities: boolean;
  canViewExecutiveDashboard: boolean;
  canViewAuditLogs: boolean;
  isReadOnly: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        canManageUsers: true,
        canManageMasterData: true,
        canCreateRequirements: true,
        canCreateDataRequests: true,
        canVerifySubmissions: true,
        canSubmitDepartmentData: true,
        canManageDepartmentActivities: true,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: true,
        isReadOnly: false,
      };

    case 'IQAC_ADMIN':
      return {
        canManageUsers: true,
        canManageMasterData: true,
        canCreateRequirements: true,
        canCreateDataRequests: true,
        canVerifySubmissions: true,
        canSubmitDepartmentData: false,
        canManageDepartmentActivities: false,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: true,
        isReadOnly: false,
      };

    case 'IQAC_MEMBER':
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: true,
        canCreateDataRequests: true,
        canVerifySubmissions: true,
        canSubmitDepartmentData: false,
        canManageDepartmentActivities: false,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: false,
        isReadOnly: false,
      };

    case 'PRINCIPAL':
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: false,
        canCreateDataRequests: false,
        canVerifySubmissions: false,
        canSubmitDepartmentData: false,
        canManageDepartmentActivities: false,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: true,
        isReadOnly: true,
      };

    case 'SCHOOL_DEAN':
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: false,
        canCreateDataRequests: false,
        canVerifySubmissions: false,
        canSubmitDepartmentData: false,
        canManageDepartmentActivities: false,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: false,
        isReadOnly: true,
      };

    case 'HOD':
    case 'DEPT_COORDINATOR':
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: false,
        canCreateDataRequests: false,
        canVerifySubmissions: false,
        canSubmitDepartmentData: true,
        canManageDepartmentActivities: true,
        canViewExecutiveDashboard: false,
        canViewAuditLogs: false,
        isReadOnly: false,
      };

    case 'FACULTY':
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: false,
        canCreateDataRequests: false,
        canVerifySubmissions: false,
        canSubmitDepartmentData: true,
        canManageDepartmentActivities: true,
        canViewExecutiveDashboard: false,
        canViewAuditLogs: false,
        isReadOnly: false,
      };

    case 'VIEWER':
    default:
      return {
        canManageUsers: false,
        canManageMasterData: false,
        canCreateRequirements: false,
        canCreateDataRequests: false,
        canVerifySubmissions: false,
        canSubmitDepartmentData: false,
        canManageDepartmentActivities: false,
        canViewExecutiveDashboard: true,
        canViewAuditLogs: false,
        isReadOnly: true,
      };
  }
}
