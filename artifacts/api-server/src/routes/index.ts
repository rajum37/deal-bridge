import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dealsRouter from "./deals";
import aicooRouter from "./aicoo";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dealsRouter);
router.use(aicooRouter);
router.use(leadsRouter);

export default router;
