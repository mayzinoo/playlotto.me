define([
    'dispatcher/AppDispatcher',
    'constants/AppConstants'
], function(
    AppDispatcher,
    AppConstants
){

    var ControlsActions = {

        placeBet: function(bet, cashOut){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.PLACE_BET,
                bet: bet,
                cashOut: cashOut
            });
        },

        savemynumbers: function(choose1,choose2,choose3,choose4,choose5,choose6){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.SAVE_MyNUMBERS,
                choose1: choose1,
                choose2: choose2,
                choose3: choose3,
                choose4: choose4,
                choose5: choose5,
                choose6: choose6
            });
        },

         buylotto: function(ticket,ticket_fee,choose1,choose2,choose3,choose4,choose5,choose6,round,userid){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.BUY_LOTO,
                ticket: ticket,
                ticket_fee: ticket_fee,
                choose1: choose1,
                choose2: choose2,
                choose3: choose3,
                choose4: choose4,
                choose5: choose5,
                choose6: choose6,
                round: round,
                userid: userid
            });
        },

        stopgame: function(){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.stopgame,
            });
        },

        presetnextround: function(nextrate){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.presetnextround,
                nextrate: nextrate
            });
        },

        cashOut: function(){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.CASH_OUT
            });
        },

        cancelBet: function(){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.CANCEL_BET
            });
        },

        setBetSize: function(betSize){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.SET_BET_SIZE,
                betSize: betSize
            });
        },

        setAutoCashOut: function(autoCashOut){
            AppDispatcher.handleViewAction({
                actionType: AppConstants.ActionTypes.SET_AUTO_CASH_OUT,
                autoCashOut: autoCashOut
            });
        }


    };

    return ControlsActions;
});