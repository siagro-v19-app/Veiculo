sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/CentroCustoHelpDialog",
	"idxtec/lib/fragment/ContaContabilHelpDialog",
	"idxtec/lib/fragment/MotoristaHelpDialog",
	"idxtec/lib/fragment/MunicipiosHelpDialog"
], function(Controller, History, MessageBox, JSONModel, CentroCustoHelpDialog,
	ContaContabilHelpDialog, MotoristaHelpDialog, MunicipiosHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecVeiculo.controller.GravarVeiculo", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarveiculo").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		},
		
		centroCustoReceived: function() {
			this.getView().byId("centrocusto").setSelectedKey(this.getModel("model").getProperty("/CentroCusto"));
		},
		
		contaContabilReceived: function() {
			this.getView().byId("contacontabil").setSelectedKey(this.getModel("model").getProperty("/ContaContabil"));
		},
		
		motoristaReceived: function() {
			this.getView().byId("motorista").setSelectedKey(this.getModel("model").getProperty("/Motorista"));
		},
		
		municipioReceived: function() {
			this.getView().byId("municipioplaca").setSelectedKey(this.getModel("model").getProperty("/MunicipioPlaca"));
		},
		
		handleSearchCentroCusto: function(oEvent){
			var oHelp = new CentroCustoHelpDialog(this.getView(), "centrocusto");
			oHelp.getDialog().open();
		},
		
		handleSearchContaContabil: function(oEvent){
			var oHelp = new ContaContabilHelpDialog(this.getView(), "contacontabil");
			oHelp.getDialog().open();
		},
		
		handleSearchMotorista: function(oEvent){
			var oHelp = new MotoristaHelpDialog(this.getView(), "motorista");
			oHelp.getDialog().open();
		},
		
		handleSearchMunicipio: function(oEvent){
			var oHelp = new MunicipiosHelpDialog(this.getView(), "municipioplaca");
			oHelp.getDialog().open();
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("centrocusto").setValue(null);
			this.getView().byId("contacontabil").setValue(null);
			this.getView().byId("motorista").setValue(null);
			this.getView().byId("municipioplaca").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Veículo"
				});
			
				var oNovoVeiculo = {
					"Id": 0,
					"Placa": "",
					"PlacaCarreta": "",
					"Propriedade": "PROPRIO",
					"VencimentoLicenciamento": null,
					"Comissao": 0.00,
					"PesoMaximo": "",
					"CentroCusto": 0,
					"ContaContabil": "",
					"Motorista": 0,
					"UfPlaca": 0,
					"MunicipioPlaca": 0,
					"Observacao": ""
				};
				
				oJSONModel.setData(oNovoVeiculo);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Veículo"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createVeiculo();
			} else if (this._operacao === "editar") {
				this._updateVeiculo();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("veiculo", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.CentroCusto = oDados.CentroCusto ? parseInt(oDados.CentroCusto, 0) : 0;
			oDados.Motorista = oDados.Motorista ? parseInt(oDados.Motorista, 0) : 0;
			oDados.UfPlaca = oDados.UfPlaca ? parseInt(oDados.UfPlaca, 0) : 0;
			oDados.MunicipioPlaca = oDados.MunicipioPlaca ? parseInt(oDados.MunicipioPlaca, 0) : 0;
			oDados.PesoMaximo = parseInt(oDados.PesoMaximo, 0); 
			
			oDados.CentroCustoDetails = {
				__metadata: {
					uri: "/CentroCustos(" + oDados.CentroCusto + ")"
				}
			};
			
			oDados.PlanoContaDetails = {
				__metadata: {
					uri: "/PlanoContas('" + oDados.ContaContabil + "')"
				}
			};
			
			oDados.MotoristaDetails = {
				__metadata: {
					uri: "/Motoristas(" + oDados.Motorista + ")"
				}
			};
			
			oDados.UfDetails = {
				__metadata: {
					uri: "/Ufs(" + oDados.UfPlaca + ")"
				}
			};
			
			oDados.MunicipioDetails = {
				__metadata: {
					uri: "/Municipios(" + oDados.MunicipioPlaca + ")"
				}
			};

			return oDados;
		},
		
		_createVeiculo: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/Veiculos", this._getDados(), {
				success: function() {
					MessageBox.success("Veículo inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateVeiculo: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Veículo alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("placa").getValue() === "" || oView.byId("placacarreta").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});