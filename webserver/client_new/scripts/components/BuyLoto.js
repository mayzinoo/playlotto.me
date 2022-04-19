define([
    'react',
    'components/Chat',
    'components/GamesLog',
    'components/Players',
    'components/SettingsSelector',
    'components/StrategyEditor',
    'stores/TabsSelectorStore',
    'actions/TabsSelectorActions',
    'components/MyBets',
    'components/RecentBets',
    'components/Bets',
    'components/LotoBuy',
], function(
    React,
    ChatClass,
    GamesLogClass,
    PlayersClass,
    SettingsSelectorClass,
    StrategyEditorClass,
    TabsSelectorStore,
    TabsSelectorActions,
    MyBetsClass,
    RecentBetsClass,
    BetClass,
    LotoBuyClass
) {

    var Chat = React.createFactory(ChatClass);
    var GamesLog = React.createFactory(GamesLogClass);
    var Players = React.createFactory(PlayersClass);
    var SettingsSelector = React.createFactory(SettingsSelectorClass);
    var StrategyEditor = React.createFactory(StrategyEditorClass);
    var myBets = React.createFactory(MyBetsClass);
    var recentBets = React.createFactory(RecentBetsClass);
    var Bets = React.createFactory(BetClass);
    var LotoBuy = React.createFactory(LotoBuyClass);

    var D = React.DOM;

     function getState(){ 
        let a = TabsSelectorStore.getState();        
        return a;
    }

    
    return React.createClass({
        displayName: 'BuyLoto',

        propTypes: {
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired
        },

        getInitialState: function () {
            return getState();
        },

         componentDidMount: function() {
            TabsSelectorStore.addChangeListener(this._onChange);
        },

        componentWillUnmount: function() {
            TabsSelectorStore.removeChangeListener(this._onChange);
        },

        _onChange: function() {
            if(this.isMounted())
                this.setState(getState());
        },
        
         _selectTab: function(tab) {
            return function() {
                TabsSelectorActions.selectTab(tab);
            }
        },

        DecreaseItem:function() {

        },

        IncrementItem: function(){

        },

        handleChange:function (event){
            
           
        },

        render: function() {

            var widget, contClass = '';
            switch(this.state.selectedTab) {
                case 'bet':
                     widget = Bets();
                     contClass = 'tabcontent active';
                    break;
                case 'lotobuy':
                    widget = LotoBuy();
                    contClass = 'tabcontent active';
                    break;
            }

           
            return D.div( {},
                        D.div({ className: 'tab' },
                            D.button({ className:"tablinks", onClick: this._selectTab('lotobuy') }, "LOTO BUY"),
                        ),

                        D.div({ className: 'widget-container ' + contClass },
                            D.div({  className: 'sc-cIShpX eJBueb' },
                                    D.span({ className: 'moreforminus', onClick:() => this.DecreaseItem() },
                                    D.i({ className:'fa fa-minus minus' }),
                                  ),
                                   D.span({ className: 'more',  onClick:() => this.IncrementItem() },
                                    D.i({ className:'fa fa-plus plus'}),
                                  ),
                                 
                                  D.input({  className:'input', spellCheck:'false', type:'text', tabIndex:'-1', value:this.state.clicks, onChange:this.handleChange.bind(this) },
                                  ),  

                                   D.button({ className:"btn_common buy-lotto", type:"button"}, "Buy Loto"),                                
                                 
                        ),

                        )
                
                   );


        }
    });

});