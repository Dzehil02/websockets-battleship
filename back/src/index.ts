import {WebSocketServer} from 'ws';
import dotenv from 'dotenv';
import {v1 as uuidv1} from 'uuid';
import {v4 as uuidv4} from 'uuid';

export const createIndexRoom = () => uuidv1();
export const createIndexUser = () => uuidv4();

dotenv.config();
const PORT = parseInt(process.env.PORT!) || 3000;

const wss = new WebSocketServer({port: PORT});

wss.on('connection', function connection(ws) {
    console.log(`Server is running on port ${PORT}`);

    ws.on('error', console.error);

    // ПЕРЕМЕННЫЕ

    const roomData = {
        type: 'update_room',
        data: [],
        id: '0',
    };

    const winnersData = {
        type: 'update_winners',
        data: [],
        id: '0',
    };

    let userName = '';
    const userSendData = {
        name: userName,
        index: createIndexUser(),
        error: false,
        errorText: 'Error text from reg',
    };

    let roomId = createIndexRoom();

    const roomUsers:any = [];

    // ПЕРЕМЕННЫЕ

    ws.on('message', function message(data) {
        console.log('received: %s', data);

        let dataObj = JSON.parse(data.toString());



        //@ts-ignore
        switch (dataObj.type) {
            case 'reg':
                //reg user 1
                const userData = JSON.parse(dataObj.data);
                userName = userData.name;
                userSendData.name = userName;
                dataObj.data = JSON.stringify(userSendData);
                ws.send(JSON.stringify(dataObj));

                //update_room
                ws.send(JSON.stringify(roomData));
                //update_winners
                ws.send(JSON.stringify(winnersData));
                break;
            case 'create_room':
                console.log(dataObj);
                console.log(userSendData);
                roomUsers.push({name: userSendData.name, index: userSendData.index});
                let roomUsersString = JSON.stringify(roomUsers);
                //@ts-ignore
                roomData.data.push({roomId, roomUsersString});
                //@ts-ignore
                console.log(roomData);
                //@ts-ignore
                ws.send(JSON.stringify(roomData));
                break;

            default:
                break;
        }
    });
});
