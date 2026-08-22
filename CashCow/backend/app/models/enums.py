from enum import Enum

class ATMStatus(str, Enum):
    OPERATIONAL = "Operational"
    LOW-CASH = "Low-Cash"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"

class CallPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    CRITICAL = "Critical"

class CallStatus(str, Enum):
    PENDING = "Pending"
    IN-PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"