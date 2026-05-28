import { organizationBranchApi } from "./modules/organizationBranchApi";
import { organizationRoleApi } from "./modules/organizationRoleApi";
import { organizationUserApi } from "./modules/organizationUserApi";
import { permissionApi } from "./modules/permissionApi";
import { merchantProductApi } from "./modules/merchantProductApi";
import { merchantCategoryApi } from "./modules/merchantCategoryApi";
import { attachmentApi } from "./modules/attachmentApi";
import { productApi } from "./modules/productApi";

export const api = {
  organizationBranch: organizationBranchApi,
  organizationUser: organizationUserApi,
  organizationRole: organizationRoleApi,
  permission: permissionApi,
  merchantProduct: merchantProductApi,
  merchantCategory: merchantCategoryApi,
  attachment: attachmentApi,
  product: productApi,
};