const request = require('supertest');
// express app
const app = require('./index');

// db setup
const { sequelize, Dog } = require('./db');
const seed = require('./db/seedFn');
const {dogs} = require('./db/seedData');

describe('Endpoints', () => {
    // to be used in POST test
    const testDogData = {
        breed: 'Poodle',
        name: 'Sasha',
        color: 'black',
        description: 'Sasha is a beautiful black pooodle mix.  She is a great companion for her family.'
    };

    beforeAll(async () => {
        // rebuild db before the test suite runs
        await seed();
    });

    describe('GET /dogs', () => {
        it('should return list of dogs with correct data', async () => {
            // make a request
            const response = await request(app).get('/dogs');
            // assert a response code
            expect(response.status).toBe(200);
            // expect a response
            expect(response.body).toBeDefined();
            // toEqual checks deep equality in objects
            expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
        });
    });

    describe('POST /dogs', () => {
        it('should create a new dog and return the correct data', async () => {
            const response = await request(app)
                .post('/dogs')
                .send(testDogData);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(testDogData));
        });
    
        it('should save the new dog in the database with matching data', async () => {
            const response = await request(app)
                .post('/dogs')
                .send(testDogData);
            
            const dogFromDb = await Dog.findByPk(response.body.id);
            expect(dogFromDb.toJSON()).toEqual(expect.objectContaining(testDogData));
        });
    });
    
    describe('DELETE /dogs/:id', () => {
        it('should delete the dog with id 1', async () => {
            const deleteResponse = await request(app).delete('/dogs/1');
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.text).toContain('deleted dog with id 1');
    
            const remainingDogs = await Dog.findAll({ where: { id: 1 } });
            expect(remainingDogs).toHaveLength(0);
        });
    });
    
});