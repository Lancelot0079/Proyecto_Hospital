import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "app4_client_rn",
  slug: "app4_client_rn",
  extra: {
    API_BASE: "https://blv61dmh-5000.use2.devtunnels.ms/", //  usamos la IP local de nuestro pc que hace las veces de servidor (cmd/ipconfig/ Dirección IPv4. . . : 192.168.0.5)
  },
};

export default config;
