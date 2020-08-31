sap.ui.define([
	"./BaseController"
], function (Controller) {
	"use strict";

	return Controller.extend("demo.FinalProject.controller.Header", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf demo.FinalProject.view.Header
		 */
		onInit: function () {
				var oView = this.getView();
				// bind Employee to View
			oView.bindElement({
				path: "/Employee(" + 1 + ")",
				event: {
					dataRequested: function () {
						oView.setBusy(true);
					},
					dataReceived: function () {
						oView.setBusy(false);
					}
				}
			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf demo.FinalProject.view.Header
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf demo.FinalProject.view.Header
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf demo.FinalProject.view.Header
		 */
		//	onExit: function() {
		//
		//	}

	});

});