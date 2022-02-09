const expressJwt = require('express-jwt')

const authJwt = () => {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoke:isRevoke
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register` 
        ] //array api khong can xac thuc    
    })
}


const isRevoke = (req,payload,done)=>{
    if(!payload.isAdmin){
        done(null,true)
    }
    done();
}
module.exports = authJwt;