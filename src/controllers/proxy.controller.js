const domainModal = require("../model/domain.model");

class proxyController {
  async findIp(req, res) {
    await domainModal.find().then((data) => {
      res.render("ip", { data: data });
    });
  }

  async updateIp(req, res) {
    await domainModal
      .findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      )
      .then((data) => {
        res.json({ status: data.status });
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật trạng thái:", err);
        res.status(500).json({ message: "Cập nhật không thành công" });
      });
  }

  async findTrash(req, res) {
    await domainModal.find().then((data) => {
      res.render("trash", { data: data });
    });
  }

  async findDomain(req, res) {
    await domainModal
      .findById(req.params.id)
      .then((data) => {
        const trueDomains = data.domain.filter(
          (domain) => domain.statusDomain === true
        );
        const falseDomains = data.domain.filter(
          (domain) => domain.statusDomain === false
        );
        res.render("domain", {
          data: data.domain,
          trueDomains,
          falseDomains,
        });
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu:", err);
        res.status(500).json({ message: "Không thể lấy dữ liệu" });
      });
  }

  async updateDomain(req, res) {
    const newStatus = req.body.status; // lấy giá trị boolean từ body
    const newTrash = req.body.trash; // lấy giá trị boolean từ body

    await domainModal
      .updateOne(
        { "domain._id": req.params.id },
        {
          $set: {
            "domain.$.statusDomain": newStatus,
            "domain.$.trash": newTrash,
          },
        },
        { new: true }
      )
      .then((data) => {
        res.json({ message: "Cập nhật trạng thái thành công", data });
      })
      .catch((err) => {
        console.error("Lỗi khi cập nhật trạng thái:", err);
        res.status(500).json({ message: "Cập nhật không thành công" });
      });
  }
}

module.exports = new proxyController();
