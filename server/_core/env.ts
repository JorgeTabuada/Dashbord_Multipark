export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  multiparkApiKey: process.env.MULTIPARK_API_KEY ?? "",
  multiparkApiUrl: process.env.MULTIPARK_API_URL ?? "https://api.multipark.pt/api/v1/bookings-api",
  zelloApiKey: process.env.ZELLO_API_KEY ?? "",
};
