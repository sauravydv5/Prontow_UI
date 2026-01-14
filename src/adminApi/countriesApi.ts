import axios from "axios";

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
}

export const getCountries = async (): Promise<Country[]> => {
  const response = await axios.get<Country[]>("https://restcountries.com/v3.1/all?fields=name,flags,cca2");
  return response.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
};