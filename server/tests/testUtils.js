// Giả lập object response của Express, cho phép assert res.status(...).json(...)
// đã được gọi với đúng tham số mà không cần dựng server HTTP thật.
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = { mockResponse };
