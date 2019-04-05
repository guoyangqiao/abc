class Abs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {qrCode: '1234241'};
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return <div id="qrCode">{this.state.qrCode}</div>
    }
}

ReactDOM.render(<Abs/>, document.getElementById('root'));