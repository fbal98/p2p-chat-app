const express = require("express");

//router definition
const router = express.Router();
let peers = [];
router.post("/add_peer", async (req, res) => {
  const { peerId } = req.body;

  peers = [...peers, peerId];
  res.send("done");
});

router.post("/get_peers", async (req, res) => {
  if (peers.length < 1) {
    res.send(null);
  } else {
    res.send(JSON.stringify(peers));
  }
});

router.post("/remove_peer", async (req, res) => {
  const { peerId } = req.body;

  peers = peers.filter((id) => id != peerId);

  res.send("done");
});

router.post("/remove_peers", async (req, res) => {
  peers = [];

  res.send("done");
});
module.exports = router;
