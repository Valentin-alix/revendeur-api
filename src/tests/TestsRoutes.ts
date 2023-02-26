import request from 'supertest'
import { server } from '../app'
import { removeUser } from '../Database'

// Test login route
describe('POST /login', () => {
  it('Should return 401 when email is missing', async () => {
    const res = await request(server).post('/login').send({ uniq_key: 'password' })
    expect(res.status).toBe(401)
    expect(res.text).toEqual('Please provide an email')
  })

  it('Should return 401 when uniq_key is missing', async () => {
    const res = await request(server).post('/login').send({ email: 'user@test.com' })
    expect(res.status).toBe(401)
    expect(res.text).toEqual('Please provide a uniq_key')
  })

  it('Should return 404 when user not found', async () => {
    const res = await request(server).post('/login').send({ email: 'user@test.com', uniq_key: 'password' })
    expect(res.status).toBe(404)
    expect(res.text).toEqual('User not found')
  })

  it('Should return access token when user found', async () => {
    const res = await request(server).post('/login').send({ email: 'didier.dupont@gmail.com', uniq_key: '1253565489799868674546747563' })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
  })
})

let authToken: string

beforeAll(async () => {
  // Authentification pour obtenir le jeton d'accès
  const response = await request(server)
    .post('/login')
    .send({ email: 'didier.dupont@gmail.com', uniq_key: '1253565489799868674546747563' })
  authToken = response.body.accessToken
})

// Test get product route
describe('GET /products/:id?', () => {
  it('should return all products', async () => {
    const res = await request(server)
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should return a single product', async () => {
    const res = await request(server)
      .get('/products/1')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('1')
  })

  it('should return a 401 if not authenticated', async () => {
    const res = await request(server).get('/products')
    expect(res.status).toBe(401)
  })
})

// test add user route
describe('POST /addUser', () => {
  it('should add a new user', async () => {
    const res = await request(server)
      .post('/addUser')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'test@example.com', uniq_key: 'password' })
    expect(res.status).toBe(201)
    expect(res.text).toContain('successfuly added')
  })

  it('should return a 401 if email is missing', async () => {
    const res = await request(server).post('/addUser')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ uniq_key: 'password' })
    expect(res.status).toBe(401)
    expect(res.text).toContain('Please provide an email')
  })

  it('should return a 401 if uniq_key is missing', async () => {
    const res = await request(server).post('/addUser')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'test@example.com' })
    expect(res.status).toBe(401)
    expect(res.text).toContain('Please provide a password')
  })

  it('should return a 400 if user can\'t be added', async () => {
    const res = await request(server)
      .post('/addUser')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: 'didier.dupont@gmail.com', uniq_key: '1253565489799868674546747563' })
    expect(res.status).toBe(400)
    expect(res.text).toContain('User can\'t be added')
  })
})

// test get user route
describe('GET /users', () => {
  // Test case when user is authenticated
  it('should return all users when the user is authenticated', async () => {
    // Send the GET request to the /users route
    const response = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`)

    // Assert the status code and response body
    expect(response.statusCode).toBe(200)
  })

  // Test case when user is not authenticated
  it('should return a 401 error when the user is not authenticated', async () => {
    // Send the GET request to the /users route
    const response = await request(server)
      .get('/users')

    // Assert the status code and response body
    expect(response.statusCode).toBe(401)
    expect(response.text).toBe('Unauthorized')
  })
})

afterAll(() => {
  removeUser('test@example.com');
  server.close();
})
