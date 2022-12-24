const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { uploadImages, uploadFile } = require('../../storage/StorageController');

class RouteController {
    async createRoute(req, res) {

    }
    async getAllRoutes(req, res) {
        let routeQuery = await db.query("SELECT * FROM ROUTES");
        res.send({
            data:routeQuery.rows
        })
        res.end();
    }

    async getOneRoute(req, res) {
        let routeId = req.body.id;
        if (routeId){
            let routeQuery = await db.query("SELECT * FROM ROUTES where id === " + routeId);
            res.send({
                data:routeQuery.rows
            })
            res.end();
        }
    }
    async updateRoute(req, res) {

    }
    async deleteRoute(req, res) {

    }
}
module.exports = new RouteController();