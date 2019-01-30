import React, {Component} from 'react';
import img from './fedexcrossborder_logo.png';
import {Stitch, RemoteMongoClient, UserPasswordCredential} from 'mongodb-stitch-browser-sdk';
import MaterialTable from 'material-table';
import Moment from 'react-moment';

// Initialize Stitch - AppID
let appId = 'crossborderapp-diwrf';
Stitch.initializeDefaultAppClient(appId);
const stitchClient = Stitch.defaultAppClient;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: []
        }

        this.isUnmounted = false;
    }

    listCurrentApiCounts() {
        console.log('List Current API Counts.');
        let username = 'myusername';
        let password = 'mypassword';
        let credential = new UserPasswordCredential(username, password);

        return stitchClient.auth.loginWithCredential(credential)
            .then(user => {
                console.log('User logged in: ' + user.id);

                // initialize the Mongo Service Client
                let mongodb = stitchClient.getServiceClient(
                    RemoteMongoClient.factory,
                    'mongodb-atlas'
                );

                let apiAccessLogCollection = mongodb.db('fedExCrossBorderDatabase').collection('apiAccessLog');

                // query the collection
                return apiAccessLogCollection.find({}, {
                    sort: {'userId': 1}
                }).asArray();
            })
            .then(results => {
                if (this.isUnmounted) {
                    console.log('Component Unmounted.');
                    return;
                }

                // set state with results
                this.setState({data: results});
            })
            .catch(error => {
                console.log('Error with listCurrentApiCounts', error);
            })
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            console.log("Component Did Mount.");

            this.setState({
                data: this.listCurrentApiCounts()
            })

        }, 2000);

    }

    componentWillUnmount() {
        console.log("Component will Unmount.");
        this.isUnmounted = true;
        clearInterval(this.interval);
    }


    render() {

        const {data} = this.state;
        let mtData = [];
        if (data.length > 0) {
            mtData = data.slice();
        }


        return (
            <div className="md-grid">
                <header className='md-cell'>
                    <img src={img} alt="logo"/>
                </header>
                <div className='header'>
                    <hr/>
                </div>
                <h2 className='md-cell md-cell--12'>API Access Log</h2>


                <div className='md-cell md-cell--6'>
                    <pre>
                        NOTE: This will component reload EVERY 2 seconds!
                    </pre>
                    <MaterialTable
                        columns={[
                            {title: 'User ID', field: 'userId'},
                            {title: 'Times Accessed', field: 'timesAccessed'},
                            {title: 'Date Last Accessed', field: 'dateLastAccessed', render: rowData => {
                                    const dateLastAccessed = rowData.dateLastAccessed
                                    return (
                                        <Moment format='MMM-DD-YYYY h:mm:ss a'>{dateLastAccessed}</Moment>
                                    )
                            }},
                            {title: 'Date API Count Reset', field: 'dateApiCountReset', render: rowData => {
                                    const dateApiCountReset = rowData.dateApiCountReset
                                    return (
                                        <Moment format='MMM-DD-YYYY h:mm:ss a'>{dateApiCountReset}</Moment>
                                    )
                            }}
                        ]}

                        data={mtData}
                        title={'Results'}

                    />
                </div>
                <div className='footer'>
                    <hr/>
                </div>
            </div>
        );
    }
}

export default App;
