const db = require('../../database');
const { bodyInjectionCheck } = require("../VarChecker");


class RouteController {
    async createRoute(req, res) {
        const body = req.body;
        const injectionCheckResult = bodyInjectionCheck(body)
        res.send(body);
        /*
        if(injectionCheckResult === "OK"){
            res.send("OK");
        }else{
            console.log(injectionCheckResult);
            res.status(401);
            res.send(injectionCheckResult + " <-- wrong input");
        }
        */
    }
    async getAllRoutes(req, res) {
        const routeQuery = await db.query(`SELECT * FROM routes;`);
        res.json({
            data: routeQuery.rows
        });
        
    }

    async getAllRoutesLimit(req, res) {
        const limit = req.params.limit;
        const routeQuery = await db.query(`SELECT * FROM routes LIMIT ${limit};`);
        res.json({
            data: routeQuery.rows
        });
    }

    async getAllRoutesCount(req, res) {
        const routeCountQuery = await db.query(`SELECT count(*) FROM routes;`);
        res.json({
            data: routeCountQuery.rows
        });
    }


    async getOneRoute(req, res) {
        const routeQuery = await db.query(`SELECT * FROM routes where ID = '${req.params.id}';`);
        res.json({
            data: routeCountQuery.rows[0]
        });
    }
    async updateRoute(req, res) {

    }
    async deleteRoute(req, res) {
        const routeQuery = await db.query(`DELETE FROM routes where ID = '${req.params.id}';`);
        res.json({
            status: routeQuery.rowCount > 0 ? "Removed" : "Not found"
        });
    }
}
module.exports = new RouteController();