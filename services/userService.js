const axios = require('axios');
 
/**
 * Función encargada de consultar la informacion del Usuario en Sesion
 */
exports.getUserInfo = async (idUser, token, res) => {
    try {
        const res = await axios.get(
            'https://access-control-ms.herokuapp.com/api/v1/users/getUser/'+idUser, {
                headers: {
                    'Authorization': token
                }
            });
        return res.data.data
    } catch (err) {
        console.error(err);
    }
};