"use strict";

const fs = require("fs");
const util = require("util");
const msRestAzure = require("ms-rest-azure");
const azureArmWebsite = require("azure-arm-website");

module.exports = {
	reportError(err, context) {
		context.done(util.inspect(err));
	},

	updateAzureAppSettings(azureConfig, newSettings) {
		if (typeof (newSettings) !== "object")
			newSettings = JSON.parse(fs.readFileSync(newSettings || "./appsettings.json", "utf8"));

		msRestAzure.loginWithServicePrincipalSecret(
			azureConfig.servicePrincipalId,
			azureConfig.servicePrincipalPassword,
			azureConfig.tenantId,
			(err, credentials) => {
				if (err) return console.error(err);

				const client = new azureArmWebsite(credentials, azureConfig.subscriptionId);
				client.sites.listSiteAppSettings(azureConfig.resourceGroup, azureConfig.siteName, (err, appSettings) => {
					if (err) return console.error(err);

					Object.assign(appSettings.properties, newSettings);
					client.sites.updateSiteAppSettings(azureConfig.resourceGroup, azureConfig.siteName, appSettings, function (err, result) {
						if (err) return console.error(err);
					});
				});
			});
	}
};