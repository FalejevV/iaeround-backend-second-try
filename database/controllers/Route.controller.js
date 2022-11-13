const db = require('../../database');
const { bodyInjectionCheck, symbolCheck } = require("../VarChecker");


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
        if(!symbolCheck(limit)){
            const routeQuery = await db.query(`SELECT * FROM routes LIMIT ${limit};`);
            res.json({
                data: routeQuery.rows
            });
        }
    }

    async getAllRoutesLimitAndSort(req,res){
        const limit = req.params.limit;
        const sortParam = req.params.sort;
        let sortByValue = "";

        if(sortParam === "0"){
            sortByValue = "ID";
        }
        if(sortParam === "1"){
            sortByValue = "ID DESC"
        }
        if(sortParam === "2"){
            sortByValue = "cardinality(likes) DESC"
        }
        if(sortParam === "3"){
            sortByValue = "cardinality(likes)"
        }
        if(sortParam === "4"){
            sortByValue = "distance DESC"
        }
        if(sortParam === "5"){
            sortByValue = "distance"
        }
        if(sortParam === "6"){
            sortByValue = "time DESC"
        }
        if(sortParam === "7"){
            sortByValue = "time"
        }
        if(Number(sortParam) > 7){
            sortByValue = "ID"
        }
        const routeQuery = await db.query(`SELECT * FROM routes ORDER BY ${sortByValue} LIMIT ${limit};`);
        res.json({
            data: routeQuery.rows
        });
    }

    async getAllRoutesLimitAndSearch(req,res){
        const limit = req.params.limit;
        const search = req.params.search;
        let routeQuery = undefined;
        if(!symbolCheck(search) && !symbolCheck(limit)){
            routeQuery = await db.query(`SELECT * FROM routes where title like '%${search}%' LIMIT ${limit}`);
        }
        res.json({
            data:routeQuery.rows
        })
    }

    async getAllRoutesCount(req, res) {
        const routeCountQuery = await db.query(`SELECT count(*) FROM routes;`);
        res.json({
            data: routeCountQuery.rows
        });
    }

    async getSearchRoutesCount(req, res) {
        let search = req.params.search;
        if(!symbolCheck(search)){
            const routeCountQuery = await db.query(`SELECT count(*) FROM routes where title like '%${search}%'`);
            res.json({
                data: routeCountQuery.rows
            });
        }
    }

    async getOneRoute(req, res) {
        if(!symbolCheck(req.params.id)){
            const routeQuery = await db.query(`SELECT * FROM routes where ID = '${req.params.id}';`);
            res.json({
                data: routeCountQuery.rows[0]
            });
        }
    }
    async updateRoute(req, res) {

    }
    async deleteRoute(req, res) {
        if(!symbolCheck(req.params.id)){
            const routeQuery = await db.query(`DELETE FROM routes where ID = '${req.params.id}';`);
            res.json({
                status: routeQuery.rowCount > 0 ? "Removed" : "Not found"
            });
        }
    }
}
module.exports = new RouteController();