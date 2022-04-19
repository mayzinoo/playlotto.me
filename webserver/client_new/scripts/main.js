requirejs.config({
    baseUrl: "/scripts", //If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js.
    paths: {
        autolinker: '../../node_modules/autolinker/dist/Autolinker',
        classnames: '../../node_modules/classnames/index',
        lodash: '../../node_modules/lodash/index',
        react: '../../node_modules/react/dist/react-with-addons',
        useRef: '../../node_modules/react/dist/react-with-addons',
        seedrandom: '../../node_modules/seedrandom/seedrandom',
        socketio: '../../node_modules/socket.io-client/dist/socket.io',
        mousetrap: '../../node_modules/mousetrap/mousetrap',
        screenfull: '../../node_modules/screenfull/dist/screenfull',
        popup: '../../node_modules/reactjs-popup/dist/reactjs-popup',
        SweetAlert: '../../node_modules/react-bootstrap-sweetalert/dist/components/SweetAlert' ,
        reactmodal: '../../node_modules/react-modal/dist/react-modal' 
    },
    shim: {

    }
});

require(['game']);