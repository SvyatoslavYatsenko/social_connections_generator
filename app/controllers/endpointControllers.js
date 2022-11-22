import {allUsers, allSubscribers} from '../config/database.mjs';

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

const getUserFriends = (userId, allUsers, allSubscribers) => {
    const userSubscribers = allSubscribers.rows.filter(el => el.user_id === userId)
    const userSubscribedOn = allSubscribers.rows.filter(el => el.friend_id === userId)

    const mutualSubscription = userSubscribedOn.filter(user => userSubscribers
        .find(el => el.friend_id === user.user_id));
    
    const friends = allUsers.rows.filter(user =>  mutualSubscription
        .find(el => el.user_id === user.id))

    const user = allUsers.rows.filter(el => el.id === userId);
        return [user, friends]
};

export function sendUserWithfriends (req, res) {
    const test = {
        userId: +req.params.id,
        orderBy: req.query.order_by,
        orderType: req.query.order_type
    };

    const result = getUserFriends(test.userId, allUsers, allSubscribers);
    let user = result[0][0];
    const friends = result[1];
    const sortFriendsByOrder = friends.sort(dynamicSort(test.orderBy));

    if (test.orderType === 'asc') {
        sortFriendsByOrder;
    } else if (test.orderType === 'desc') {
        sortFriendsByOrder.reverse();
    };

    const userWithFriends = {...user, friends: sortFriendsByOrder};

    res.send(userWithFriends)
}
