import adminInstance from "./adminInstance";


export const getAllProducts = () => adminInstance.get('/products');
export const updateProduct = ({id, data}: {id: string, data: any}) => adminInstance.put(`/products/${id}`, data);
export const getProductById = ({id}) => adminInstance.get(`/products/${id}`);
export const addProduct = ({data}) => adminInstance.post('/products', data);
export const deleteProduct = ({id}) => adminInstance.delete(`/products/${id}`);
