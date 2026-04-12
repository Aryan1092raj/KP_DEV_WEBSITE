import api from "../lib/api";

export function createAdminCrudService(resource) {
  const adminResource = `/admin/${resource}`;

  return {
    getAdminAll: async () => (await api.get(adminResource)).data,
    create: async (payload) => (await api.post(adminResource, payload)).data,
    update: async (id, payload) =>
      (await api.put(`${adminResource}/${id}`, payload)).data,
    remove: async (id) => (await api.delete(`${adminResource}/${id}`)).data,
  };
}

export function createAdminListService(resource) {
  const adminResource = `/admin/${resource}`;

  return {
    getAdminAll: async () => (await api.get(adminResource)).data,
  };
}
