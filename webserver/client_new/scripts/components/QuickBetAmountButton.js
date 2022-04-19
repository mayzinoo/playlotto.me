define([
    'react',
    'game-logic/clib',
    'game-logic/stateLib',
    'constants/AppConstants',
    'components/Payout'
], function(
    React,
    Clib,
    StateLib,
    AppConstants,
    PayoutClass
){

    var D = React.DOM;
    var Payout = React.createFactory(PayoutClass);

    return React.createClass({
        displayName: 'QuickBetAmountButton',

        propTypes: {
            amount: React.PropTypes.number.isRequired,
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired
        },

        getInitialState: function() {
            return {
              value: this.props.amount
            };
        },

        componentDidMount: function() {
        },

        componentWillUnmount: function() {
        },

        _onGameCrash: function() {
        },

        _initialDisableTimeout: function() {
        },

        _cashOut: function () {
        },

        _setQuickBetAmount: function() {

        },

        render: function() {
            var self = this;

            var smallButton = this.props.isMobileOrSmall || this.props.controlsSize === 'small';

            var btnClasses, btnContent = [], onClickFun = null, onMouseDownFun = null, onMouseUpFun = null;
            btnClasses = 'quick-bet-amount-button';

            onMouseDownFun = this._setQuickBetAmount;

            return D.div({ className: 'quick-bet-amount-button-container' },
                D.button({ className: btnClasses, onClick: onClickFun, onMouseDown: onMouseDownFun, onMouseUp: onMouseUpFun },
                    this.props.amount
                )
            );
        }
    });

});