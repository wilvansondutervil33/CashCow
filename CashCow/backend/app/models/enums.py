from enum import Enum

class ATMStatus(str, Enum):
    OPERATIONAL = "Operational"
    LOW_CASH = "Low-Cash"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"

class CallPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    CRITICAL = "Critical"

class CallStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class UserRole(str, Enum):
    OPERATION_ADMIN = "Operations Admin"
    FIELD_TECHNICIAN = "Field Technician"
    AUDITOR = "Auditor"