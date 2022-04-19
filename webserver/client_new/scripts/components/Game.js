/**
 * This view acts as a wrapper for all the other views in the game
 * it is subscribed to changes in EngineVirtualStore but it only
 * listen to connection changes so every view should subscribe to
 * EngineVirtualStore independently.
 */
define([
    'react',    
    //'components/TopBar',
    'components/ChartControls',
    'components/TabsSelector',
    'components/TabsHistorySelector',
    'components/Players',
    'components/BetBar',
    'game-logic/engine',
    'game-logic/clib',
    'game-logic/hotkeys',
    'stores/GameSettingsStore',
    'components/Ball',
    'components/Bouncy',
    'components/ResultBall',
    'components/SettingAlert',
    'components/BuyLoto',
    'components/History', 
    'components/Mylotto',
    'actions/ControlsActions',
    'game-logic/engine'       
    
], function (
    React,    
    //TopBarClass,
    ChartControlsClass,
    TabsSelectorClass,
    TabsHistorySelectorClass,
    PlayersClass,
    BetBarClass,
    Engine,
    Clib,
    Hotkeys,
    GameSettingsStore,
    BallClass,
    BouncyClass,
    ResultBallClass,
    SettingAlertClass, 
    BuyLotoClass,
    HistoryClass,
    MylottoClass,
    ControlsActions,
    Engine
     
) {
    //var TopBar = React.createFactory(TopBarClass);
    //var SpaceWrap = React.createFactory(SpaceWrapClass);
    var ChartControls = React.createFactory(ChartControlsClass);
    var TabsSelector = React.createFactory(TabsSelectorClass);
    var TabsHistorySelector = React.createFactory(TabsHistorySelectorClass);
    var Players = React.createFactory(PlayersClass);
    var BetBar = React.createFactory(BetBarClass);
    var Ball = React.createFactory(BallClass);
    var BouncyClass = React.createFactory(BouncyClass);
    var ResultBall = React.createFactory(ResultBallClass);
    var SettingAlert = React.createFactory(SettingAlertClass);
    var BuyLoto = React.createFactory(BuyLotoClass);
    var History = React.createFactory(HistoryClass);
    var Mylotto = React.createFactory(MylottoClass);
    
    
    var D = React.DOM;

    return React.createClass({
        displayName: 'Game',

        getInitialState: function () {
            var state = GameSettingsStore.getState();
            state.isConnected = Engine.isConnected;
            state.username = Engine.username;
            state.balance = Engine.balance;
            state.showMessage = true;
            state.stop = 'false'; 
            state.minutes = 0;
            state.seconds = 0; 
            state.number1 = 0;
            state.number2 = 0;  
            state.number3 = 0;  
            state.number4 = 0;  
            state.number5 = 0;  
            state.number6 = 0; 
            state.choose1 = Engine.mynum1;
            state.choose2 = Engine.mynum2;  
            state.choose3 = Engine.mynum3;  
            state.choose4 = Engine.mynum4;  
            state.choose5 = Engine.mynum5;  
            state.choose6 = Engine.mynum6;  
            state.x1 = 130;
            state.y1 = 250;
            state.x2 = 130;
            state.y2 = 250;
            state.level = '';
            state.hide = false;
            state.color = 'red';
            state.choose = null;
            state.settingwarning = null;
            state.displayMenu = false;
            state.modalVisible = false;
            state.settingwarningVisible = false;
            state.regularcount = 0;
            state.luckycount = 0;
            state.regulardisabled = true;
            state.luckydisabled = true;
            state.settingdisabled = true;
            state.regularclass = "btn_common lotto_purple";
            state.luckyclass = "btn_lucky lotto_purple";
            state.ticket = 1;
            state.status = Engine.gameState;
            state.fornextround = '';
            state.round = 'first';
            state.bgregular =  'btn_common lotto_purple';
            state.bglucky =  'btn_lucky lotto_purple';
            state.currentdround = null;
            state.tempround = null;   
            state.tempbalance = null;  
            state.engine = Engine;           
            state.jackpot_payamount = null;
            state.loto_price = Engine.loto_price;
            state.hover = false;
            state.windowsize = null;
            
            //state.balanceBitsFormatted= Clib.formatBits(Engine.balance);
            state.theme= 'black';//black || white           
            state.isMobileOrSmall = Clib.isMobileOrSmall(); //bool
            return state;
        },

        componentDidMount: function () { 
        //alert(window.innerWidth)      
        this.setState({ windowsize: window.innerWidth });       
           
            Engine.on({
                'connected': this._onEngineChange,
                'disconnected': this._onEngineChange
            });

            this.setState({ choose1: Engine.mynum1 });
            this.setState({ choose2: Engine.mynum2 });
            this.setState({ choose3: Engine.mynum3 });
            this.setState({ choose4: Engine.mynum4 });
            this.setState({ choose5: Engine.mynum5 });
            this.setState({ choose6: Engine.mynum6 });

            this.setState({ number1: Engine.number1 });
            this.setState({ number2: Engine.number2 });
            this.setState({ number3: Engine.number3 });
            this.setState({ number4: Engine.number4 });
            this.setState({ number5: Engine.number5 });
            this.setState({ number6: Engine.number6 });

            this.setState({ username: Engine.username });
            this.setState({ balance: Engine.balance });
            this.setState({ loto_price: Engine.loto_price });
            //this.setState({ jackpot_payamount: Engine.jackpot_payamount });


            GameSettingsStore.addChangeListener(this._onSettingsChange);

            window.addEventListener("resize", this._onWindowResize);

            Hotkeys.mount();

            setInterval(this.timerInterval,1000);

            setInterval(this.getNumbers,1000);        
            
            this.openModal = this.openModal.bind(this);


        }, 

       openModal: function() {        
            //console.log("Open modal called ", this.state.modalVisible);
            const modalVisible = !this.state.modalVisible;
            this.setState({ modalVisible });
            //this.setState({ regulardisabled : false });
            //this.setState({ luckydisabled : false });
          },

        OpenSettingWarning: function() {
            //console.log("Open warning called ", this.state.modalVisible);
            const settingVisible = !this.state.settingwarningVisible;
            this.setState({ settingwarningVisible: settingVisible });
          },  

        OpenSettingSuccess: function() {
            //console.log("Open warning called ", this.state.modalVisible);
            const settingVisible = !this.state.settingsuccessVisible;
            this.setState({ settingsuccessVisible: settingVisible });
          },       

        componentWillUnmount: function () {
            

            Engine.off({
                'connected': this._onChange,
                'disconnected': this._onChange
            });

            window.removeEventListener("resize", this._onWindowResize);

            Hotkeys.unmount();

            clearInterval(this.myInterval);
        },

        _onEngineChange: function () {

            if ((this.state.isConnected != Engine.isConnected) && this.isMounted())
                this.setState({ isConnected: Engine.isConnected });
        },

        _onSettingsChange: function () {
            if (this.isMounted())
                this.setState(GameSettingsStore.getState());
        },

        _onWindowResize: function () {
            var isMobileOrSmall = Clib.isMobileOrSmall();
            if (this.state.isMobileOrSmall !== isMobileOrSmall)
                this.setState({ isMobileOrSmall: isMobileOrSmall });
        },

        _hideMessage: function () {
            this.setState({ showMessage: false });
        },

        
        getNumbers: function() {
            //alert(Engine.gameState);
            //this.setState({ balance: Engine.balance });

            this.setState({ number1: Engine.number1 });
            this.setState({ number2: Engine.number2 });
            this.setState({ number3: Engine.number3 });
            this.setState({ number4: Engine.number4 });
            this.setState({ number5: Engine.number5 });
            this.setState({ number6: Engine.number6 });


            if(Engine.gameState === 'STARTING'){
                this.setState({ number1: Engine.number1 });
            this.setState({ number2: Engine.number2 });
            this.setState({ number3: Engine.number3 });
            this.setState({ number4: Engine.number4 });
            this.setState({ number5: Engine.number5 });
            this.setState({ number6: Engine.number6 });
                      
                this.setState( { status : Engine.gameState });
            }

            if(Engine.gameState !== 'ENDED')
            {                
                 this.setState( { fornextround : 'true' }); 
            }
            else{
                this.setState( { fornextround : 'false' }); 
            }                
        },

        showmynumber: function() {
          const numclass = "overlay2";
          const getAlert = function(){
            return D.div( {  },
                    Updatenum({ success :true,
                               cname: numclass  }));
           };

           this.setState({ choose: getAlert() });
        
        },

        showDropdownMenu: function(event) {            
            event.preventDefault();
            this.setState({ displayMenu: true } );
            this.setState({ displayMenu: true }, () => {
            document.addEventListener('click', this.hideDropdownMenu);
            });
          },

          hideDropdownMenu: function() {
            this.setState({ displayMenu: false }, () => {
              document.removeEventListener('click', this.hideDropdownMenu);
            });
          },

        timerInterval: function() {           

            var opt= {
                timeZone: Engine.timezone,
                month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric'
            };

            if(new Date(Engine.roundnumber)){
               var formatter = new Intl.DateTimeFormat([], opt);
            var localTime = formatter.format(new Date(Engine.roundnumber));

            this.setState({ currentround: localTime }); 
            }

            

            this.setState({ jackpot_payamount: Engine.jackpot_payamount });
            this.setState({ loto_price: Engine.loto_price });
            


            if(Engine.min !=null && Engine.sec!=null){
                this.setState({ seconds: Engine.sec+1 });
                this.setState({ minutes: Engine.min });

                var minutes = this.state.minutes;
                var seconds = this.state.seconds;
        
                  if (this.state.seconds > 0) {
                    this.setState({ seconds: seconds - 1 });

                       if(this.state.seconds === 1){
                          var tmpround = this.state.currentround;
                          this.setState({ tempround: tmpround });

                          var tmpbal = this.state.balance;
                          this.setState({ tempbalance: tmpbal });
                       }
                        
                    }
                    if (this.state.seconds === 0 && this.state.minutes === 0) {
                        if (this.state.minutes === 0) {
                            
                            clearInterval(this.myInterval)
                            
                            this.setState({ currentround: this.state.tempround });
                            //console.log('current balance', this.state.balance)
                            this.setState({ tempbalance: this.state.balance });

                            var user = this.state.username;
                            var userbal;
                            //console.log('Table History', this.state.engine.tableHistory);
                            var rows = this.state.engine.tableHistory.slice(0, 1).map(function (game, i) {
                                if(game.player_info !== null){
                                    console.log(game.player_info)
                                    Object.keys(game.player_info).forEach(function(oneplayer) {
                                        console.log(game.player_info[oneplayer])
                                        //console.log(user)
                                        if(game.player_info[oneplayer].username === user){
                                            console.log(game.player_info[oneplayer].balance)
                                            //this.setState({ balance: game.player_info[oneplayer].balance });
                                            userbal = game.player_info[oneplayer].balance;
                                            //this.setbalance
                                        }
                                        
                                    });
                               }                
                            });  

                            //console.log('outer', userbal)
                            if(isNaN(userbal))
                            {
                                this.setState({ balance: this.state.tempbalance });
                                
                            }    
                            else{
                                this.setState({ balance: userbal });
                            }
                            
                            
            
                        } else {
                            
                            this.setState({ seconds: 59 });
                            this.setState({ minutes: minutes - 1 });
                            
                        }
                    } 
            } else{}            
        },

        ResetNumbers: function(){
            this.setState({ regulardisabled: false });
            this.setState({ luckydisabled: false });
            this.setState({ settingdisabled: false });            

            for(var i=1;i<29;i++){
                var did = 'regular'+i;
                document.getElementById(did).setAttribute("class", "btn_common lotto_purple");
            }

            for(var j=0;j<10;j++){
                var lid = 'lucky'+j;
                document.getElementById(lid).setAttribute("class", "btn_lucky lotto_purple");
            }

            this.setState({ regularcount: 0 });
            this.setState({ luckycount: 0 });

            //Resetting numbers to state
            this.setState({ choose1: null });
            this.setState({ choose2: null });
            this.setState({ choose3: null });
            this.setState({ choose4: null });
            this.setState({ choose5: null });
            this.setState({ choose6: null }); 
        },  

        regularClick: function(event){
            //alert(event.currentTarget.id);
            this.setState({ bgregular: 'btn_common lotto_purple check' });
            var rcount = Number(this.state.regularcount) + 1;
            
            this.setState({ regularcount: rcount });

            this.setState({ regularclass: "btn_common lotto_purple check" }); 
            
            //Save choose numbers
            var choosenum = event.currentTarget.id;
            var selectnum = choosenum.replace('regular','');
            
            if(rcount === 1){                
                document.getElementById(choosenum).setAttribute("class", "btn_common lotto_purple check");                
                this.setState({ choose1: selectnum });   
            }

            else if(rcount === 2){                         
                document.getElementById(choosenum).setAttribute("class", "btn_common lotto_purple check");  
                this.setState({ choose2: selectnum });                    
            }
            else if(rcount === 3){          
                document.getElementById(choosenum).setAttribute("class", "btn_common lotto_purple check");
                this.setState({ choose3: selectnum });               
            }
            else if(rcount === 4){                           
                document.getElementById(choosenum).setAttribute("class", "btn_common lotto_purple check");
                this.setState({ choose4: selectnum });   
            }
            else if(rcount === 5){                        
                document.getElementById(choosenum).setAttribute("class", "btn_common lotto_purple check");
                this.setState({ choose5: selectnum });
                this.setState({ regulardisabled: 'disabled' }); 
                 
            }
            else{ }
        },

        luckyClick: function(event){
            //alert(event.currentTarget.id);
             this.setState({ bglucky: 'btn_lucky lotto_purple check' });
            var lcount = Number(this.state.luckycount) + 1;
            this.setState({ luckycount: lcount }); 
            //this.setState({ luckydisabled: true });
            this.setState({ luckyclass: "btn_lucky lotto_purple check" });  

            //Save choose numbers
            var choosenum2 = event.currentTarget.id;
            var selectnum2 = choosenum2.replace('lucky','');
            if(lcount === 1){                
                document.getElementById(choosenum2).setAttribute("class", "btn_lucky lotto_purple check");
                this.setState({ choose6: selectnum2 });
                this.setState({ luckydisabled: 'disabled' });
                  
            }
            else{}
         
        },

        settingClick: function(){
            if(this.state.choose1 !=null && this.state.choose2 !=null && this.state.choose3 !=null && this.state.choose4 !=null && this.state.choose5 !=null && this.state.choose6 !=null)
            {
                const settingsuccessVisible = !this.state.settingsuccessVisible;
                this.setState({  settingsuccessVisible });

                ControlsActions.savemynumbers(this.state.choose1,this.state.choose2,this.state.choose3,this.state.choose4,this.state.choose5,this.state.choose6);
            }
            else{
              const settingwarningVisible = !this.state.settingwarningVisible;
              this.setState({  settingwarningVisible });  
            }       
        },

        DecreaseItem:function() {
            if(Number(this.state.ticket) > 1){
                var dec_val = Number(this.state.ticket) - 1;
                this.setState({  ticket: dec_val });
            }
            else{}
        },

        IncrementItem: function(){
            var inc_val = Number(this.state.ticket) + 1;
            this.setState({  ticket: inc_val });
        },

        handleChange:function (event){
            this.setState({ ticket : event.target.value});           
        },

        handleMouseIn: function() {            
            this.setState({ hover: true })
        },
          
      handleMouseOut: function() {            
        this.setState({ hover: false });
      },

      setbalance: function(newbalance){
          //this.setState({ balance: newbalance });
      },

        _buylotto: function () {
             //alert(Engine.roundnumber)
             // alert(this.state.choose2) 
             // alert(this.state.choose3) 
             // alert(this.state.choose4) 
             // alert(this.state.choose5) 
             // alert(this.state.choose6)  
             this.setState({ balance: Engine.balance });

            if(this.state.choose1 ===null && this.state.choose2 ===null && this.state.choose3 ===null && this.state.choose4 ===null && this.state.choose5 ===null && this.state.choose6 ===null)
            {
                //alert(this.state.choose3)
                var choose1 = Number(Engine.mynum1);
                var choose2 = Number(Engine.mynum2);
                var choose3 = Number(Engine.mynum3);
                var choose4 = Number(Engine.mynum4); 
                var choose5 = Number(Engine.mynum5);
                var choose6 = Number(Engine.mynum6);
                var ticket  = Number(this.state.ticket);
                var round   = Engine.roundnumber;
                var ticket_fee =  Number(ticket) * Number(Engine.loto_price);
                var userid = Engine.userid;
                if(this.state.balance === null){
                    var balance = Number(Engine.balance) - ticket_fee;
                }
                else{
                    var balance = Number(this.state.balance) - ticket_fee;
                }
                
                this.setState({ balance : balance}); 

                ControlsActions.buylotto(ticket, ticket_fee, choose1,choose2,choose3,choose4,choose5,choose6,round,userid);
            }
           if(this.state.choose1 !=null && this.state.choose2 !=null && this.state.choose3 !=null && this.state.choose4 !=null && this.state.choose5 !=null && this.state.choose6 !=null)
            {
                //alert(this.state.choose3)
                var choose1 = Number(this.state.choose1);
                var choose2 = Number(this.state.choose2);
                var choose3 = Number(this.state.choose3);
                var choose4 = Number(this.state.choose4); 
                var choose5 = Number(this.state.choose5);
                var choose6 = Number(this.state.choose6);
                var ticket  = Number(this.state.ticket);
                var round   = Engine.roundnumber;
                var ticket_fee =  Number(ticket) * Number(Engine.loto_price);
                var userid = Engine.userid;
                var balance = Number(this.state.balance) - ticket_fee;
                this.setState({ balance : balance}); 

                ControlsActions.buylotto(ticket, ticket_fee, choose1,choose2,choose3,choose4,choose5,choose6,round,userid);
            }
            else{
              const settingwarningVisible = !this.state.settingwarningVisible;
              this.setState({  settingwarningVisible });  
            }             
        },


        render: function () {
            // console.log(Engine.mynum1);
            // console.log(Engine.mynum2);
            // console.log(Engine.mynum3);
            // console.log(Engine.mynum4);
            // console.log(Engine.mynum5);          
            

         if (!this.state.isConnected)
                return D.div({ id: 'loading-container' },
                    D.div({ className: 'loading-image' },
                        D.span({ className: 'bubble-1' }),
                        D.span({ className: 'bubble-2' }),
                        D.span({ className: 'bubble-3' })
                    )
                );


            var messageContainer;
            if (USER_MESSAGE && this.state.showMessage) {

                var messageContent, messageClass, containerClass = 'show-message';
                switch (USER_MESSAGE.type) {
                    case 'error':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.text)
                        );
                        messageClass = 'error';
                        break;
                    case 'newUser':
                        messageContent = D.span(null,
                            D.a({ href: "/request" }, "Welcome to bustabit.com, to start you have 2 free bits, bits you can request them here or you can just watch the current games... have fun :D")
                        );
                        messageClass = 'new-user';
                        break;
                    case 'received':
                        messageContent = D.span(null,
                            D.span(null, "Congratulations you have been credited " + USER_MESSAGE.qty + " free bits. Have fun!")
                        );
                        messageClass = 'received';
                        break;
                    case 'advice':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.advice)
                        );
                        messageClass = 'advice';
                        break;
                    case 'collect':
                        messageContent = D.span(null,
                            D.a({ href: '/request' }, 'Collect your two free bits!')
                        );
                        messageClass = 'collect';
                        break;
                    default:
                        messageContent = null;
                        messageClass = 'hide';
                        containerClass = '';
                }

                messageContainer = D.div({ id: 'game-message-container', className: messageClass },
                    messageContent,
                    D.a({ className: 'close-message', onClick: this._hideMessage }, D.i({ className: 'fa fa-times' }))
                )
            } else {
                messageContainer = null;
                containerClass = '';
            }

            // var rightContainer = !this.state.isMobileOrSmall ?
            //     D.div({ id: 'game-right-container' },
            //         Players(),
            //         BetBar()
            //     ) : null;

            var rightContainer = !this.state.isMobileOrSmall ?

                D.div({ id: 'game-right-container' },
                    Players(),
                    BetBar()
                ) : null;

                 var fortimer = []; var ball = []; var test = []; var mynumbers = []; const regularlist = []; const luckylist = []; const warning = [];
                 const buyloto = []; const history = []; const mylotto = []; const btnloto = []; const current_round = []; const balance = []; const jackpotpay = [];
                 var timer_minutes = 0;
                 var timer_seconds = 0;

                 history.push( History({ n1: this.state.number1,
                                         n2: this.state.number2,
                                         n3: this.state.number3,
                                         n4: this.state.number4,
                                         n5: this.state.number5,
                                         n6: this.state.number6         } ) );

                 mylotto.push( Mylotto({ n1: this.state.number1,
                                         n2: this.state.number2,
                                         n3: this.state.number3,
                                         n4: this.state.number4,
                                         n5: this.state.number5,
                                         n6: this.state.number6         } ) );

                 if(this.state.hover === true){                    
                    var tooltipStyle = {
                      display: 'block'
                    }
                 }
                 else{                    
                    var tooltipStyle = {
                      display: 'none'
                    }
                 }
                 
                if(this.state.minutes === 0 && this.state.seconds <= 5){
                    btnloto.push(D.button({ className:'btn_common buy-lotto', type:"button", }, "Buy Loto"),
                            D.span({ className:'tooltiptext', style: tooltipStyle }, 'Cannot buy lotto' ),
                        );                  
                 } 
                else{
                    // if(this.state.balance === 0){
                    //     btnloto.push(D.button({ className:'btn_common buy-lotto', type:"button", }, "Buy Loto"),
                    //         D.span({ className:'tooltiptext', style: tooltipStyle }, 'Please deposit balance first.' ),   
                    // }
                    // else{
                    //    if(this.state.choose1 === null && this.state.choose2 === null && this.state.choose3 === null && this.state.choose4 === null && this.state.choose5 === null && this.state.choose6 === null)
                    //      {
                    //         btnloto.push(D.button({ className:'btn_common buy-lotto', type:"button", }, "Buy Loto"),
                    //             D.span({ className:'tooltiptext', style: tooltipStyle }, 'Please choose numbers first.' ),
                    //      }
                    //      else{
                            btnloto.push(D.button({ className:'btn_common buy-lotto', type:"button", onClick: this._buylotto }, "Buy Loto"));
                    //      } 
                    // }
                    
                }
                 
                buyloto.push( 
                            D.div({ className: 'cell-wrapper' },
                                   D.div( {},
                                        D.div({ className: 'tabb' },
                                            D.div({ className:"tablinkss" }, ""),
                                        ),

                                        D.div({ className: 'widget-container tabcontentt active' },
                                            D.div({  className: 'sc-cIShpX eJBueb' },
                                                    D.span({ className: 'moreforminus', onClick:() => this.DecreaseItem() },
                                                    D.i({ className: 'fa fa-minus minus' }),
                                                  ),
                                                   D.span({ className: 'more',  onClick:() => this.IncrementItem() },
                                                    D.i({ className:'fa fa-plus plus'}),
                                                  ),
                                                 
                                                  D.input({  className:'input', spellCheck:'false', type:'text', tabIndex:'-1',
                                                                 value:this.state.ticket, onChange:this.handleChange.bind(this) },
                                                  ),  

                                                   btnloto,                                
                                                 
                                        ),

                                    )
                
                            )
                                )
                        );                         

                 if(this.state.regulardisabled === true){
                    var dis_number = 'btn_common lotto_purple num_disable';
                 }
                 else{
                    var dis_number = 'btn_common lotto_purple';
                 }

                 if(this.state.luckydisabled === true){
                    var dis_lucky = 'btn_lucky lotto_purple num_disable';
                 }
                 else{
                    var dis_lucky = 'btn_lucky lotto_purple';
                 }

                 if(this.state.settingdisabled === true){
                    var dis_setting = 'btn num_disable';
                 }
                 else{
                    var dis_setting = 'btn';
                 }

                
                 for (var i=1; i < 29; i++) {
                    if(i=== Engine.mynum1 || i=== Engine.mynum2 || i=== Engine.mynum3 || i=== Engine.mynum4 || i=== Engine.mynum5)
                    {
                        var btnclass = 'btn_common lotto_purple check';
                    }
                    else{
                        var btnclass = 'btn_common lotto_purple';
                    } 
                    regularlist.push( 
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:btnclass, onClick:this.regularClick, 
                                id: "regular"+i, value:{i} }  ,
                                {i} )
                            )
                        );
                 }   

                 for (var j=0; j < 10; j++) {
                    if(j=== Engine.mynum6)
                    {
                        var btnclass2 = 'btn_lucky lotto_purple check';
                    }
                    else{
                        var btnclass2 = 'btn_lucky lotto_purple';
                    } 
                    luckylist.push( 
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.luckydisabled, className:btnclass2, onClick:this.luckyClick,
                                 id: "lucky"+j, value:{j}  }  ,
                                {j} )
                            )
                        );
                 }

                 //console.log('round', this.state.currentround);
                 // console.log('n2', this.state.number2);
                 // console.log('n3', this.state.number3);
                 // console.log('n4', this.state.number4);
                 // console.log('n5', this.state.number5);                 
                 // console.log('n6', this.state.number6);  

                //if(Engine.min != null && Engine.sec != null) {               
                
                    fortimer.push( 
                            D.div({ className: 'count-down' },
                                       D.span({id:'ten-countdown'  },                         
                                        'Timer:' + this.state.minutes +':' + this.state.seconds,
                                        )
                            )
                        );
                    //}


                    current_round.push( 
                            D.span({ className: 'count-down roundnum' },                                                              
                                        'Current Round:' + this.state.currentround ,
                                       
                            )
                        );



                    if(this.state.balance === null){
                        var user_balance = Engine.balance;
                    }
                    else{
                        user_balance = this.state.balance;
                    }
                    balance.push( 
                            D.span({ className: 'count-down roundnum' },                                                              
                                        '      Balance:' + user_balance ,
                                       
                            )
                        );

                    // balance.push( 
                    //         D.span({ className: 'count-down roundnum' },                                                              
                    //                     '      Loto Price:' + this.state.loto_price ,
                                       
                    //         )
                    //     );
                    

                    let styles = this.state.modalVisible
                                      ? { display: "block" }
                                      : { display: "none" };

                    let warningstyles = this.state.settingwarningVisible
                                      ? { display: "block" }
                                      : { display: "none" }; 

                   let successstyles = this.state.settingsuccessVisible
                                      ? { display: "block" }
                                      : { display: "none" };                                     

                     if(this.state.settingwarningVisible){
                        warning.push( 
                            D.div({ id: 'warning', className: "modal fade in overlaywarning", id:"warning", style:warningstyles }, 
                             D.div({ className:"modal-dialog"} ,
                               D.button({ onClick: this.OpenSettingWarning , type:"button" ,className:"overlay-close" }, "CLOSE"),               
                                D.p({ className: '' }, 'You must choose 6 numbers.' ), 
                               
                                ) 
                             )
                         ); 
                    }   
                    else{  } 

                    if(this.state.settingsuccessVisible){
                        warning.push( 
                            D.div({ id: 'warning', className: "modal fade in overlaywarning", id:"warning", style:successstyles }, 
                             D.div({ className:"modal-dialog"} ,
                               D.button({ onClick: this.OpenSettingSuccess , type:"button" ,className:"overlay-close" }, "CLOSE"),               
                                D.p({ className: '' }, 'Successfully processed.' ), 
                               
                                ) 
                             )
                         ); 
                    }   
                    else{  }                        

                
                    mynumbers.push(  D.div({ className:"modal fade in overlay2", id:"myalert" , role:"dialog" , height: '500px',  style:styles },                        
                             D.div({ className:"modal-dialog"} ,                                
                                D.button({ onClick: this.openModal , type:"button" ,className:"overlay-close" },),

                                D.div({ className:"row"} ),
                                    D.div( { className: "col-md-12 mynum_area" } ),
                                        D.div( {className: "mynum_content" }, 
                                            D.h3({}, "REGULAR BALL SELECTION" ),
                                            D.p( {}, "Please choose 5 numbers" ),
                                            D.div({ className: "num_list"},
                                                regularlist ),

                                            D.div( { className: "top_sm_padding"} ,
                                                D.h3({}, "LUCKY BALL SELECTION" ),
                                                D.p( {}, "Please choose 1 number" ),
                                                D.div({ className: "num_list"}, 
                                                    luckylist ),
                                                ),

                                            D.div( {className: "row"},
                                                D.div({ className: "col-md-6 top_sm_padding sett" },
                                                    D.button({ type: "button", className:"btn", id:"btn_reset", onClick: this.ResetNumbers } , "Reset" )
                                                 ),
                                                D.div({ className: "col-md-6 top_sm_padding sett" },
                                                    D.button({ type: "button", className:"btn dis_setting", id:"btn_setting", disabled: this.state.settingdisabled, 
                                                        onClick: this.settingClick } , "Setting" )
                                                 )
                                                )
                                                
                                        )  

                                )       
                             
                             )
                         );                    


                    ball.push( D.div({ className: 'forball' },
                         Ball( { num1:this.state.number1,
                                 num2:this.state.number2,
                                 num3:this.state.number3,
                                 num4:this.state.number4,
                                 num5:this.state.number5,
                                 num6:this.state.number6,
                                 status:this.state.status,
                                 fornextround:this.state.fornextround,
                                 round:this.state.round,
                                 windowsize: this.state.windowsize
                                  } ) ) ); 

                let dropdownlist = [];

                

                if(Engine.min != null && Engine.sec != null)
                {
                    if(this.state.displayMenu){
                        dropdownlist.push( 
                        D.ul({  },
                            D.li({ className: "active" },
                                D.a({ href: "/account" }, "My Account" ) ),
                            D.li({ className: "active" }, 
                                D.span({ onClick: this.openModal }, "My Number" ) ,                         
                            D.li({ clallName: "active"  }, 
                                D.a({ href: "/logout" }, "Log Out" ) ),
                           ) )
                     );
                    } else{}

                }
                else{
                    if(this.state.displayMenu){
                    dropdownlist.push( 
                        D.ul({  },
                            D.li({ className: "active" },
                                D.a({ href: "/account" }, "My Account" ) ),
                            D.li({ className: "active" }, 
                                D.span({ onClick: this.openModal }, "My Number" ) ,                         
                            D.li({ clallName: "active"  }, 
                                D.a({ href: "/logout" }, "Log Out" ) ),
                           ) )
                     );
                    } else {}
                }

                // if(this.state.displayMenu){
                //     dropdownlist.push( 
                //         D.ul({  },
                //             D.li({ className: "active" },
                //                 D.a({ href: "/account" }, "My Account" ) ),
                //             D.li({ className: "active" }, 
                //                 D.span({ onClick: this.openModal }, "My Number" ) ,                            
                //             D.li({ clallName: "active"  }, 
                //                 D.a({ href: "/logout" }, "Log Out" ) ),
                //            ) 
                //      ); 
                // }   
                // else{  }                

                var userLogin; var dropdown = []; 
                var spanStyle = {
                    
                    justifyContent: "center"
                  }; 
                           
            dropdown.push( D.div({ className: 'dropdown' , style: spanStyle },
                                D.form({ action: "/logout", method: "post", id:"logout" }),
                               D.i({ className: 'fa fa-ellipsis-v fa-2x' , onClick:this.showDropdownMenu }), 
                               dropdownlist           
            
                            ) );
                
            
            if(Engine.username !=null) {

                userLogin = D.div({ className: 'user-login' },
                    D.div({ className: 'balance-bits' },
                        // D.span(null, 'Bits: '),
                        D.span({ className: 'balance' }, this.state.balanceBitsFormatted )
                    ),
                    D.div({ className: 'username', style: spanStyle },
                         dropdown
                    )
                );
            } else {
                userLogin = D.div({ className: 'user-login' },
                    D.div({ className: 'register' },
                        D.a({ href: '/register' }, 'Register' )
                    ),
                    D.div({ className: 'login' },
                        D.a({ href: '/login'}, 'Log in' )
                    )
                );
            }

             spanStyle = {
                    width: "200px",
                    backgroundColor: "#929693"
                  }; 

            

            return D.div({ id: 'game-inner-container' },

                
                D.div({ id: 'top-bar' },

                    D.div({className:'container'},
                        D.div({className:'row header_wrapper'},
                            D.div({className:'col-md-12 col-lg-12 col-sm-12 header'},
                                D.div({className:'left_header'},
                                    D.div({ className: 'title' },
                                            D.a({ href: '/' },
                                                // D.h1(null, this.props.isMobileOrSmall? 'WWGO' : 'Wowgo')
                                                // D.h1(null, 'Wowgo')
                                                D.h1(null, 'LuckyBall')
                                            )
                                        )
                                    ),
                                D.div({className:'right_header'},
                                        userLogin
                                    )
                                )
                             )

                        )
                    ),

                // D.div({ id: 'game-playable-container', className: containerClass },
                //     D.div({ id: 'game-left-container', className: this.state.isMobileOrSmall? ' small-window' : '' },
                //         D.div({ id: 'chart-controls-row' },
                //             D.div({ id: 'chart-controls-col', className: this.state.controlsSize },
                //                 D.div({ className: 'cell-wrapper' },
                //                     ChartControls({
                //                         isMobileOrSmall: this.state.isMobileOrSmall,
                //                         controlsSize: this.state.controlsSize
                //                     })
                //                 )
                //             )
                //         ),

                //     ),

                //     rightContainer
                // ),
                // D.div({ id: 'tabs-controls-row' },
                //             D.div({ id: 'tabs-controls-col' },
                //                 D.div({ className: 'cell-wrapper' },
                //                     TabsSelector({
                //                         isMobileOrSmall: this.state.isMobileOrSmall,
                //                         controlsSize: this.state.controlsSize
                //                     })
                //                 )
                //             )
                //         ),

               


                D.div({ id: 'game-upper-container', className: containerClass,className:'game-bg' },
                    D.div({ id: 'game-left-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                        D.div({ id: 'chart-controls-row' },
                            D.div({ id: 'chart-controls-col', className: this.state.controlsSize },
                                // D.div({ className: 'cell-wrapper' },
                                //     ChartControls({
                                //         isMobileOrSmall: this.state.isMobileOrSmall,
                                //         controlsSize: this.state.controlsSize,
                                //         minutes: this.state.minutes,
                                //         seconds: this.state.seconds
                                //     })
                                // ),
                                ball,

                                fortimer,

                                current_round,
                                balance,

                                buyloto,

                                
                                 mylotto,             
                                 history,

                               
                                //  D.div({ className: 'cell-wrapper' },
                                //     Timer({
                                //         isMobileOrSmall: this.state.isMobileOrSmall,
                                //         controlsSize: this.state.controlsSize,
                                //         minutes: timer_minutes,
                                //         seconds: timer_seconds
                                //     })
                                // ),
                            ),
                            
                        ),

                    ),

                    mynumbers,
                    warning                 
                                 
                   
                ),
                // D.div({ id: 'game-lower-container', className: containerClass },
                //     D.div({ id: 'game-lower-bottom-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //         D.div({ id: 'tabs-controls-row' },
                //             D.div({ id: 'tabs-controls-col' },
                //                 D.div({ className: 'cell-wrapper' },
                //                     TabsSelector({
                //                         isMobileOrSmall: this.state.isMobileOrSmall,
                //                         controlsSize: this.state.controlsSize
                //                     })
                //                 )
                //             )
                //         ),
                //     ),
                // ),


                // D.div({ id: 'game-lower-container', className: containerClass },
                //     D.div({ id: 'game-left-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //         D.div({ id: 'game-lower-bottom-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //             D.div({ id: 'tabs-controls-row' },
                //                 D.div({ id: 'tabs-controls-col' },
                //                     D.div({ className: 'cell-wrapper' },
                //                         TabsHistorySelector({
                //                             isMobileOrSmall: this.state.isMobileOrSmall,
                //                             controlsSize: this.state.controlsSize
                //                         })
                //                     )
                //                 )
                //             ),
                //         ),
                //     ),
                //     D.div({ id: 'game-right-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //         D.div({ id: 'game-lower-bottom-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //             D.div({ id: 'tabs-controls-row' },
                //                 D.div({ id: 'tabs-controls-col' },
                //                     D.div({ className: 'cell-wrapper' },

                //                         TabsSelector({
                //                             isMobileOrSmall: this.state.isMobileOrSmall,
                //                             controlsSize: this.state.controlsSize
                //                         })
                //                     )
                //                 )
                //             ),
                //         ),
                //     ),
                //),





                // D.div({ id: 'game-playable-container', className: containerClass },
                //     D.div({ id: 'game-left-container', className: this.state.isMobileOrSmall ? ' small-window' : '' },
                //         D.div({ id: 'chart-controls-row' },
                //             D.div({ id: 'chart-controls-col', className: this.state.controlsSize },
                //                 D.div({ className: 'cell-wrapper' },
                //                     ChartControls({
                //                         isMobileOrSmall: this.state.isMobileOrSmall,
                //                         controlsSize: this.state.controlsSize
                //                     })
                //                 )
                //             )
                //         ),


                //     ),

                //     // D.div({ id: 'game-right-container' },
                //     //     Players(),
                //     //     BetBar(),
                //     // ),
                //     // D.div({ id: 'game-right-bottom-container' },
                //     //     D.div({ id: 'chart-controls-row' },
                //     //         D.div({ id: 'tabs-controls-col' },
                //     //             D.div({ className: 'cell-wrapper' },
                //     //                 TabsSelector({
                //     //                     isMobileOrSmall: this.state.isMobileOrSmall,
                //     //                     controlsSize: this.state.controlsSize
                //     //                 })
                //     //             )
                //     //         )
                //     //     )
                //     // ),
                //     D.div({ id: 'game-right-container' },
                //         Players(),
                //         BetBar(),
                //     ),
                //     D.div({ id: 'game-right-bottom-container' },
                //         D.div({ id: 'chart-controls-row' },
                //             D.div({ id: 'tabs-controls-col' },
                //                 D.div({ className: 'cell-wrapper' },
                //                     TabsSelector({
                //                         isMobileOrSmall: this.state.isMobileOrSmall,
                //                         controlsSize: this.state.controlsSize
                //                     })
                //                 )
                //             )
                //         )
                //     ),

                // ),
                 
            );
        }
    });

});