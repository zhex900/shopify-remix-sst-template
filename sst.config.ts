/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "test",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const sessionsTable = new sst.aws.Dynamo("SessionsTable", {
      fields: {
        id: "string",
        shop: "string",
      },
      primaryIndex: { hashKey: "id" },
      globalIndexes: {
        shopIndexName: {
          hashKey: "shop",
        },
      },
    });

    const shopifyAppUrl = new sst.Secret("AppUrl", "SHOPIFY_APP_URL");
    const shopifyApiKey = new sst.Secret("ApiKey", process.env.SHOPIFY_API_KEY);
    const shopifyApiSecret = new sst.Secret(
      "ApiSecret",
      process.env.SHOPIFY_API_SECRET,
    );

    new sst.aws.Remix("ShopifyApp", {
      link: [sessionsTable, shopifyApiKey, shopifyApiSecret, shopifyAppUrl],
      environment: {
        SHOP_CUSTOM_DOMAIN: process.env.SHOP_CUSTOM_DOMAIN || "",
        SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || "",
        SESSIONS_TABLE_NAME: sessionsTable.name,
        REGION: "ap-southeast-2",
      },
    });
  },
});
