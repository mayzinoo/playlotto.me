define([
    'react',
    'lodash',
    'game-logic/clib',
    'components/GraphicDisplay',
    'components/TextDisplay',
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',
    'components/Bouncy',
    'components/ResultBall',
       
], function(
    React,
    _,
    Clib,
    GraphicDisplayClass,
    TextDisplayClass,
    Engine,
    ChartStore,
    GameSettingsStore,
    BouncyClass,
    ResultBallClass,
    
){

    var D = React.DOM;

    var GraphicDisplay = new GraphicDisplayClass();
    var TextDisplay = React.createFactory(TextDisplayClass);
    var Bouncy = React.createFactory(BouncyClass);
    var ResultBall = React.createFactory(ResultBallClass);
    
    
   

    function getState(){
        return _.merge({}, ChartStore.getState(), GameSettingsStore.getState());
    }   

    return React.createClass({
        displayName: 'Dropdown',

        propTypes: {
            // num1: React.PropTypes.number.isRequired,
            // num2: React.PropTypes.number.isRequired,
            // num3:React.PropTypes.number.isRequired, 
            // num4: React.PropTypes.number.isRequired,
            // num5: React.PropTypes.number.isRequired,
            // num6:React.PropTypes.number.isRequired, 
            // status:React.PropTypes.string.isRequired,            
        },

         getInitialState: function () {
            var state = GameSettingsStore.getState();            
            state.displayMenu = false;
            state.alert = '';
            return state;
        },

        componentDidMount(){
            //this.showDropdownMenu = this.showDropdownMenu.bind(this);
            //this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
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

        logout: function() {
        if (document.getElementById('logout') ) {
            if (confirm("Are you sure you want to log out?")) {
                document.getElementById("logout").submit();
            }
        }
    },

    showmynumber: function() {
     
    
    },

        render: function() {
            spanStyle = {
                    width: "200px",
                    backgroundColor: "#929693"
                  }; 

            let dropdownlist = []; 

            if(this.state.displayMenu === true){
                dropdownlist.push( 
                    D.ul({  },
                        D.li({ clallName: "active" },
                            D.a({ href: "/account" }, "My Account" ) ),
                        D.li({ clallName: "active" }, 
                            D.span({ onClick: this.showmynumber }, "My Number" ) ),                            
                        D.li({ clallName: "active"  }, 
                            D.a({ href: "/logout" }, "Log Out" ) ),
                       ) 
                 ); 
            }   
            else{ }


                   return D.div({ className: 'dropdown' , style: spanStyle },
                                D.form({ action: "/logout", method: "post", id:"logout" }),
                               D.div({ className: 'button' , onClick:this.showDropdownMenu }, "Setting" ), 
                               dropdownlist           
            
                            )
                        

        }
    });
});