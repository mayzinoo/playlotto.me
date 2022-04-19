define([
    'react',
    'components/GraphicsContainer',
    'components/ControlsSelector',
    'components/Timer',
], function (
    React,
    GraphicsContainerClass,
    ControlsSelectorClass,
    TimerClass,
) {
    var D = React.DOM;

    var GraphicsContainer = React.createFactory(GraphicsContainerClass);
    var ControlsSelector = React.createFactory(ControlsSelectorClass);
    var Timer = React.createFactory(TimerClass);

    return React.createClass({
        displayName: 'Chart-Controls',

        propTypes: {
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired,
            minutes:React.PropTypes.string.isRequired,
            seconds:React.PropTypes.string.isRequired,
        },

        render: function () {
            return D.div({ id: 'chart-controls-inner-container', className: this.props.controlsSize },
                D.div({ id: 'chart-container', className: this.props.controlsSize },
                    GraphicsContainer({
                        isMobileOrSmall: this.props.isMobileOrSmall,
                        controlsSize: this.props.controlsSize
                    })
                ),
                
                // D.div({ id: 'controls-container', className: this.props.controlsSize },
                //     D.div({ id: 'wowgo-helper' },
                //         // D.img src={require('../../img/telegram.png')}> </img>
                //         D.div({ id: 'telegram-photo' },
                //             D.img({ id: 'telegram-size', src: '../../img/telegram.png', },)
                //         ),
                //         D.div('', ' Telegram:@wowgohelper')
                //     ),
                //     ControlsSelector({
                //         isMobileOrSmall: this.props.isMobileOrSmall,
                //         controlsSize: this.props.controlsSize
                //     })
                // )
            );
        }
    });
});