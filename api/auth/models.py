from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow, fields
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import db, ma

class Verification(db.Model):
    __tablename__ = "verification"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    status = db.Column(db.String, default="unverified")
    code = db.Column(db.String, nullable=True)
    code_valid_until = db.Column(db.DateTime, nullable=True)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class VerificationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Verification
        fields = ("status",)


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    name = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.String, default="user")
    status = db.Column(db.String, default="active")
    verification = db.relationship("Verification", uselist=False, backref="verification")


    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    @staticmethod
    def generate_hash(password):
        return generate_password_hash(password)

    @staticmethod
    def verify_hash(password, hash):
        return check_password_hash(hash, password)

class UserSchema(ma.SQLAlchemyAutoSchema):
    verification = ma.Nested(VerificationSchema())
    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "status", "verification")

class RevokedTokenModel(db.Model):
    __tablename__ = 'revoked_tokens'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blacklisted(cls, jti):
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)