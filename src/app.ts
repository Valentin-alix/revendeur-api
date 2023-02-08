import * as express from 'express';
import axios from 'axios';
const app = express()
const port = 3000
const urlMockapi = 'https://615f5fb4f7254d0017068109.mockapi.io/api/v1';

app.get('/', (req : any, res : any) => {
  res.send('Hello World!')
})

app.get('/products/:id?', (req : any, res : any) => {
  axios.get(`${urlMockapi}/products/${req.params.id ?? ''}`)
    .then((resp) => {
      res.set('Cache-control', 'public, max-age=86400');
      res.json(resp.data);
    })
    .catch((error) => {
      res.status(500);
      res.json(error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
