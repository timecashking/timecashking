import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.json({ status: 'up', service: 'timecashking-api' });
});

app.listen(port, () => {
  console.log('server listening on port ' + port);
});
