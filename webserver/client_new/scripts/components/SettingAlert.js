define([
    'react',
    'components/GraphicsContainer',
    'components/ControlsSelector' 
], function (
    React,
    GraphicsContainerClass,
    ControlsSelectorClass, 

) {
    var D = React.DOM;

    var GraphicsContainer = React.createFactory(GraphicsContainerClass);
    var ControlsSelector = React.createFactory(ControlsSelectorClass);

     
    

    return React.createClass({
        displayName: 'SettingAlert',

         closeNav:function (event) 
         {        
             document.getElementById("warning").setAttribute("class", "overlay");        
         },


        propTypes: {
            cname:React.PropTypes.string.isRequired,
                        
        },         

          render: function () {
            console.log('xxxxxx', this.props.cname);
            return D.div({ id: 'warning', className: this.props.cname }, 
               D.a({ className:'closebtn', onClick:this.closeNav },  'X', ),               
                D.p({ className: '' }, 'You must choose 6 numbers.' ), 
               
                );    
        }   
                                
    });
});

    

    


