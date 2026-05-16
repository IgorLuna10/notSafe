import pytest
import os
from unittest.mock import MagicMock, patch

os.environ["SECRET_KEY"] = "test_secret_key_notSafe_32bytes!!"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"


def make_mongo_mock():
    mock = MagicMock()
    mock.db.checks.insert_one.return_value = MagicMock()
    mock.db.checks.count_documents.return_value = 0
    mock.db.checks.aggregate.return_value = iter([])
    return mock


@pytest.fixture
def app():
    mongo_mock = make_mongo_mock()

    with patch("flask_pymongo.PyMongo.init_app"), \
         patch("app.extensions.mongo", mongo_mock), \
         patch("app.services.analytics_service.mongo", mongo_mock), \
         patch("app.controllers.dashboard_controller.mongo", mongo_mock), \
         patch("app.controllers.tools_controller.mongo", mongo_mock):

        from app import create_app
        application = create_app()
        application.config["TESTING"] = True
        application.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        application.config["CACHE_TYPE"] = "SimpleCache"
        application.config["RATELIMIT_ENABLED"] = False

        with application.app_context():
            from app.extensions import db
            db.create_all()
            yield application
            db.session.remove()
            db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()