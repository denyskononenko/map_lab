from flask import Flask
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

class InfoGetter(Resource):
    def get(self):
        return {'test': 'info'}

api.add_resource(InfoGetter, '/')

if __name__ == '__main__':
    app.run(debug=True)