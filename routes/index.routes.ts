import { Router } from "express";

const router: Router = Router();

router.get('/', (req, res) => {
    res.send('API Trabajando OK!')
});

export default router;