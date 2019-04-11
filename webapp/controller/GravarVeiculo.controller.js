sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecVeiculo/helpers/CentroCustoHelpDialog",
	"br/com/idxtecVeiculo/helpers/ContaContabilHelpDialog",
	"br/com/idxtecVeiculo/helpers/MotoristaHelpDialog",
	"br/com/idxtecVeiculo/helpers/MunicipiosHelpDialog",
	"br/com/idxtecVeiculo/helpers/UfHelpDialog",
	"br/com/idxtecVeiculo/services/Session"
], function(Controller, History, MessageBox, JSONModel, CentroCustoHelpDialog,
	ContaContabilHelpDialog, MotoristaHelpDialog, MunicipiosHelpDialog, UfHelpDialog, Session) {
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
		
		ufReceived: function() {
			this.getView().byId("ufplaca").setSelectedKey(this.getModel("model").getProperty("/UfPlaca"));
		},
		
		handleSearchCentroCusto: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			CentroCustoHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchContaContabil: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ContaContabilHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchMotorista: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			MotoristaHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchMunicipio: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			MunicipiosHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchUf: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			UfHelpDialog.handleValueHelp(this.getView(), sInputId, this);
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
			this.getView().byId("ufplaca").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Veículo"
				});
			
				var oNovoVeiculo = {
					"Id": 0,
					"Placa": "",
					"PlacaCarreta": "",
					"Propriedade": "PROPRIO",
					"VencimentoLicenciamento": new Date(),
					"Comissao": 0.00,
					"PesoMaximo": 0,
					"CentroCusto": 0,
					"ContaContabil": "",
					"Motorista": 0,
					"UfPlaca": 0,
					"MunicipioPlaca": 0,
					"Observacao": "",
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoVeiculo);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Veículo"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
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
			
			oDados.CentroCusto = oDados.CentroCusto ? oDados.CentroCusto : 0;
			oDados.Motorista = oDados.Motorista ? oDados.Motorista : 0;
			oDados.UfPlaca = oDados.UfPlaca ? oDados.UfPlaca : 0;
			oDados.MunicipioPlaca = oDados.MunicipioPlaca ? oDados.MunicipioPlaca : 0;
			
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
			debugger; 
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