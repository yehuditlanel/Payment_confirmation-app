sap.ui.define(["./BaseController"], function (Controller) {
	"use strict";
	return Controller.extend("demo.FinalProject.controller.App", {
		/**
		 * A model for view an amount by type of currency
		 */
		oAmountData: {
			AmountILS: 0,
			AmountUSD: 0,
			AmountEUR: 0
		},
		/**
		 * A Model for displaying how many payments for approval there are
		 * and how many of them have been selected for approval 
		 * and keeps the ID of the selected payments within listForApproval
		 */
		oItemsData: {
			Total: 0,
			Selected: 0,
			listForApproval: []
		},
		onInit: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel(this.oItemsData), "Items");
			this.getView().setModel(new sap.ui.model.json.JSONModel(this.oAmountData), "Amount");
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf demo.FinalProject.view.App
		 */
		onAfterRendering: function () {
			var aPath = this.getView().byId("vboxItems");
			aPath.onAfterRendering = function () {
				var count = 0;
				var oItems = aPath.getItems();
				for (var i = 0; i < oItems.length; i++) {
					if (oItems[i].getVisible() === true)
						count++;
				}
				this.getModel("Items").setProperty("/Total", count);
				this.getModel("Items").setProperty("/Selected", 0);
				var oModelAmount = this.getModel("Amount");
				this.oAmountData = {
					AmountILS: 0,
					AmountUSD: 0,
					AmountEUR: 0
				};
				oModelAmount.setData(this.oAmountData);
				this.getModel("Items").getData().listForApproval = [];
			};
		},
		/**
		 *@memberOf demo.FinalProject.controller.App
		 * this function opens the rejection dialog
		 */
		onOpenPopup: function (oEvent) {
			var vID = oEvent.getSource().data().id;
			var oView = this.getView();
			//bind Payments to View
			oView.bindElement({
				path: "/Payments(" + vID + ")",
				event: {
					dataRequested: function () {
						oView.setBusy(true);
					},
					dataReceived: function () {
						oView.setBusy(false);
					}
				}
			});
			var oDialog = oView.byId("PopupReject");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "demo.FinalProject.view.fragments.PopupReject", this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialog);
			}
			this.getView().byId("reasonOfRejectTextArea").setValue("");
			oDialog.open();
		},
		onClose: function () {
			this.byId("PopupReject").close();
		},
			/**
		 * When rejection 
		 * update the ApproveType=2 and ApproveMessage of the selected item
		 */
		onReject: function (oEvent) {
			var vID = oEvent.getSource().data().id;//get the id of selected item
			var oModel = this.getModel();
			oModel.update("/Payments(" + vID + ")", {
				ApproveType: 2,
				ApproveMessage: this.getView().byId("reasonOfRejectTextArea").getValue()
			}, {
				success: function () {
					sap.m.MessageToast.show("תשלום נדחה");
				},
				error: function () {
					sap.m.MessageToast.show("שגיאה:\nשרת לא זמין");
				}

			});
			this.onClose();
		},
		/**
		 *@memberOf demo.FinalProject.controller.App
		 */
		onSelect: function (oEvent) {
			var oID = oEvent.getSource().data().id.toString();
			var oPanel = oEvent.getSource().getParent().getParent();
			var oModelAmount = this.getModel("Amount");
			var oModelItems = this.getModel("Items");
			 //Get the information of selected item
			var oCurrency = oEvent.getSource().data().currency;
			var oAmount = oEvent.getSource().data().amount;
			var AmountILS = oModelAmount.getData().AmountILS,
				AmountUSD = oModelAmount.getData().AmountUSD,
				AmountEUR = oModelAmount.getData().AmountEUR;
			if (oEvent.getSource().getSelected()) {
				this.getModel("Items").getData().listForApproval.push(oID);//save the id in a list 
				oModelItems.getData().Selected += 1;//update the sum of seleced
				oPanel.addStyleClass("onSelect");//change the style
				switch (oCurrency) {//checked the currency type
				case "ILS":
					{
						AmountILS = parseFloat(oAmount) + AmountILS;
						break;
					}
				case "USD":
					{
						AmountUSD = parseFloat(oAmount) + AmountUSD;
						break;
					}
				case "EUR":
					AmountEUR = parseFloat(oAmount) + AmountEUR;
					break;
				}
			} else {
				var index = this.getModel("Items").getData().listForApproval.indexOf(oID);
				this.getModel("Items").getData().listForApproval.splice(index, 1);//remove the id from list
				oModelItems.getData().Selected -= 1;//update the sum of seleced
				oPanel.removeStyleClass("onSelect");
				switch (oCurrency) {
				case "ILS":
					{
						AmountILS = AmountILS - parseFloat(oAmount);
						break;
					}
				case "USD":
					{
						AmountUSD = AmountUSD - parseFloat(oAmount);
						break;
					}
				case "EUR":
					AmountEUR = AmountEUR - parseFloat(oAmount);
					break;
				}
			}
			oModelItems.setData(this.oItemsData);
			this.oAmountData = {
				AmountILS: AmountILS,
				AmountUSD: AmountUSD,
				AmountEUR: AmountEUR
			};
			oModelAmount.setData(this.oAmountData);
		},

		/**
		 *@memberOf demo.FinalProject.controller.App
		 * approve the payment according the list of selected
		 */
		onOK: function (oEvent) {
			var oModel = this.getModel();
			var list = this.getModel("Items").getData().listForApproval;
			for (var i = 0; i < list.length; i++) {
				oModel.setProperty("/Payments(" + list[i] + ")/ApproveType", 1);
			}
			this.getModel().submitChanges({
				success: function () {
					sap.m.MessageToast.show("תשלומי ריצה \nאושרו");
				},
				error: function () {
					sap.m.MessageToast.show("שגיאה");
				}
			});
		},

		/**
		 *@memberOf demo.FinalProject.controller.App
		 *  When all the items are selected The function triggers the event for each item
		 */
		onSelectedAll: function (oEvent) {

			var panels = this.getView().byId("vboxItems").getItems();
			for (var i = 0; i < panels.length; i++) {
				if (panels[i].getVisible() === true) {
					var oSelect = this.getView().byId("__xmlview0--checkBox-__xmlview0--vboxItems-" + i).getSelected();
					if (oSelect === false) {
						this.getView().byId("__xmlview0--checkBox-__xmlview0--vboxItems-" + i).setSelected(true);
						this.getView().byId("__xmlview0--checkBox-__xmlview0--vboxItems-" + i).fireSelect();//Activates the event clicking on the check box
					}
				}

			}
		}
	});
});