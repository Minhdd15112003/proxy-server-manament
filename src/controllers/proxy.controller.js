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

  async findBlockWhite(req, res) {
    await domainModal
      .findById(req.params.id)
      .then((data) => {
        const whileDomains = data.domain.filter(
          (domain) => domain.blockWhiteStatus === 2
        );
        const blockDomains = data.domain.filter(
          (domain) => domain.blockWhiteStatus === 1
        );

        res.render("blockWhiteStatus", {
          idIp: data.id,
          data: data.domain,
          whileDomains,
          blockDomains,
        });
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu:", err);
        res.status(500).json({ message: "Không thể lấy dữ liệu" });
      });
  }

  async updateAllDomains(req, res) {
    const { status } = req.body;
    const { id } = req.params;

    try {
      const updatedData = await domainModal.findByIdAndUpdate(
        id,
        {
          $set: {
            "domain.$[].statusDomain": status,
          },
        },
        { new: true }
      );

      if (!updatedData) {
        return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
      }

      res.json({
        message: "Cập nhật trạng thái thành công",
        data: updatedData,
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      res.status(500).json({ message: "Cập nhật trạng thái không thành công" });
    }
  }

  async findDomain(req, res) {
    await domainModal
      .findById(req.params.id)
      .then((data) => {
        const domain = data.domain.filter(
          (domain) => domain.blockWhiteStatus === 0
        );
        const trueDomains = data.domain.filter(
          (domain) =>
            domain.statusDomain === true && domain.blockWhiteStatus === 0
        );
        const falseDomains = data.domain.filter(
          (domain) =>
            domain.statusDomain === false && domain.blockWhiteStatus === 0
        );
        res.render("domain", {
          idIp: req.params.id,
          data: domain,
          trueDomains,
          falseDomains,
        });
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu:", err);
        res.status(500).json({ message: "Không thể lấy dữ liệu" });
      });
  }

  async postblockDomain(req, res) {
    const { domainName, subDomainName, blockWhiteStatus, domainLable } =
      req.body;

    // Kiểm tra sự tồn tại của domain
    const existDomain = await domainModal
      .findById(req.params.id)
      .then((data) => {
        return data.domain.filter((domain) => domain.domainName === domainName);
      });

    // Nếu domain đã tồn tại, trả về lỗi
    if (existDomain.length > 0) {
      return res.status(500).json({ message: "Tên miền đã tồn tại" });
    }

    try {
      // Cập nhật thông tin domain và subdomains
      await domainModal.findByIdAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            domain: {
              domainLable: domainLable,
              domainName: domainName,
              subdomain: subDomainName,
              blockWhiteStatus: blockWhiteStatus,
            },
          },
        }
      );

      // Trả về thông báo thành công
      res.json({ message: "Thêm tên miền thành công" });
    } catch (err) {
      console.error("Lỗi khi thêm tên miền:", err);
      res.status(500).json({ message: "Thêm tên miền không thành công" });
    }
  }

  async updateBlockDomain(req, res) {
    const { domainName, subDomainName, blockWhiteStatus, domainLable } =
      req.body;
    // // Kiểm tra sự tồn tại của domain
    // const existDomain = await domainModal
    //   .findById(req.params.id)
    //   .then((data) => {
    //     return data.domain.filter((domain) => domain.domainName === domainName);
    //   });

    // if (existDomain.length > 0) {
    //   return res.status(500).json({ message: "Tên miền đã tồn tại" });
    // }

    await domainModal
      .updateOne(
        { "domain._id": req.params.domainid },
        {
          $set: {
            "domain.$.domainLable": domainLable,
            "domain.$.domainName": domainName,
            "domain.$.subdomain": subDomainName,
            "domain.$.blockWhiteStatus": blockWhiteStatus,
          },
        },
        { new: true }
      )
      .then((data) => {
        res.json({ message: "Cập nhật tên miền thành công", data });
      })
      .catch((err) => {
        res
          .status(500)
          .json({
            message: "Cập nhật tên miền không thành công",
            err: err.message,
          });
      });
  }

  async postDomain(req, res) {
    const domainName = req.body.domainName;
    const statusDomain = req.body.statusDomain;
    const blockWhiteStatus = req.body.blockWhiteStatus;

    const existDomain = await domainModal
      .findById(req.params.id)
      .then((data) => {
        const domainnn = data.domain.filter(
          (domain) => domain.domainName === domainName
        );
        return domainnn;
      });
    if (existDomain.length > 0) {
      res.status(500).json({ message: "Tên miền đã tồn tại" });
      return;
    }
    await domainModal
      .findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            domain: {
              domainName: domainName,
              statusDomain: statusDomain,
              blockWhiteStatus: blockWhiteStatus,
            },
          },
        },
        { new: true }
      )
      .then((data) => {
        res.json({ message: "Thêm tên miền thành công", data });
      })
      .catch((err) => {
        console.error("Lỗi khi thêm tên miền:", err);
        res.status(500).json({ message: "Thêm tên miền không thành công" });
      });
  }

  async updateStatusDomain(req, res) {
    const newStatus = req.body.status;
    const newTrash = req.body.blockWhiteStatus;

    await domainModal
      .updateOne(
        { "domain._id": req.params.id },
        {
          $set: {
            "domain.$.statusDomain": newStatus,
            "domain.$.blockWhiteStatus": newTrash,
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
