import adminInstance from "./adminInstance";

interface SectionPayload {
  title: string;
  type: 'token' | 'cash';
  value: number;
  color: string;
  probability: number;
}

interface AddWheelPayload {
  name: string;
  sections: SectionPayload[];
  isActive?: boolean;
}

//get list of spin wheels
export const getSpinWheelList = () => {
  return adminInstance.get('/spin-wheel');
};

//get spin wheel by id
export const getSpinWheelById = (id: string) => {
  return adminInstance.get(`/spin-wheel/${id}`);
};

//add new spin wheel
export const addSpinWheel = (wheelData: AddWheelPayload) => {
  return adminInstance.post('/spin-wheel', wheelData);
};

//update spin wheel
export const updateSpinWheel = (id: string, wheelData: Partial<AddWheelPayload>) => {
  return adminInstance.put(`/spin-wheel/${id}`, wheelData);
};

//delete spin wheel
export const deleteSpinWheel = (id: string) => {
  return adminInstance.delete(`/spin-wheel/${id}`);
};

//spin the wheel
export interface SpinWheelPayload {
  tokensToUse: number;
}

export const spinTheWheel = (id: string, payload: SpinWheelPayload) => {
  return adminInstance.get(`/spin-wheel/${id}`, { params: payload });
};

//get user spin records
export const getSpinWheelRecords = () => {
  return adminInstance.get('/spin-wheel/records');
};