import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
  headers: {"Content-Type":"application/json"}, timeout: 15000
});
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_BASE_URL || "http://localhost:8081/api/auth",
  headers: {"Content-Type":"application/json"}, timeout: 15000
});

const attachToken = config => {
  const token = localStorage.getItem("spendwise_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(attachToken);
authApi.interceptors.request.use(attachToken);

const errorHandler = err => {
  const data=err?.response?.data;
  const message=data?.message || data?.error || (typeof data==="string"?data:"") || err.message || "Request failed";
  return Promise.reject(new Error(message));
};
api.interceptors.response.use(r=>r,errorHandler);
authApi.interceptors.response.use(r=>r,errorHandler);

export const unwrap=r=>r?.data;
export const apiBase=api.defaults.baseURL;
export const authBase=authApi.defaults.baseURL;
export const oauthBase=authBase.replace(/\/api\/auth\/?$/,'');

export const authApiClient={
  login:body=>authApi.post("/login",body),
  register:(body,config)=>authApi.post("/register",body,config),
  me:()=>authApi.get("/me"),
  linkProfile:(authUserId,profileId)=>authApi.patch(`/users/${authUserId}/profile`,{profileId}),
  adminUsers:()=>authApi.get("/admin/users"),
  adminSetRole:(id,value)=>authApi.patch(`/admin/users/${id}/role`,null,{params:{value}}),
  adminDeleteUser:id=>authApi.delete(`/admin/users/${id}`)
};
export const userApi={
  list:()=>api.get("/users"), byId:id=>api.get(`/users/${id}`), create:body=>api.post("/users",body),
  update:(id,body)=>api.put(`/users/${id}`,body), remove:id=>api.delete(`/users/${id}`)
};
export const categoryApi={list:userId=>api.get(`/categories/user/${userId}`),byId:(userId,id)=>api.get(`/categories/${id}`,{params:{userId}}),create:body=>api.post("/categories",body),update:(userId,id,body)=>api.put(`/categories/${id}`,body,{params:{userId}}),remove:(userId,id)=>api.delete(`/categories/${id}`,{params:{userId}})};
const resource=path=>({list:userId=>api.get(`/${path}/user/${userId}`),byId:(userId,id)=>api.get(`/${path}/${id}`,{params:{userId}}),create:body=>api.post(`/${path}`,body),update:(userId,id,body)=>api.put(`/${path}/${id}`,body,{params:{userId}}),remove:(userId,id)=>api.delete(`/${path}/${id}`,{params:{userId}})});
export const expenseApi={...resource("expenses"),filter:(userId,params)=>api.get(`/expenses/user/${userId}/filter`,{params})};
export const incomeApi={...resource("income"),filter:(userId,params)=>api.get(`/income/user/${userId}/filter`,{params})};
export const budgetApi=resource("budgets"); export const goalApi=resource("savings-goals"); export const recurringApi=resource("recurring-expenses");
export const dashboardApi={get:userId=>api.get(`/dashboard/${userId}`),transactions:(userId,params)=>api.get(`/dashboard/${userId}/transactions`,{params})};
export const reportApi={summary:(userId,fromDate,toDate)=>api.get(`/reports/${userId}`,{params:{fromDate,toDate}}),pdf:(userId,fromDate,toDate)=>api.get(`/reports/${userId}/pdf`,{params:{fromDate,toDate},responseType:"blob"})};
export default api;
