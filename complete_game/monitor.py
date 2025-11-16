#!/usr/bin/env python3
"""
Production Monitoring Script for The Arcane Codex
Monitors application health, resource usage, and alerts on issues
"""
import os
import sys
import time
import json
import logging
import requests
import psutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/arcane-codex/monitor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class MonitoringConfig:
    """Monitoring configuration"""

    def __init__(self):
        self.service_url = os.getenv('MONITOR_SERVICE_URL', 'http://localhost:5000')
        self.check_interval = int(os.getenv('MONITOR_CHECK_INTERVAL', 60))
        self.alert_threshold_cpu = float(os.getenv('ALERT_THRESHOLD_CPU', 80.0))
        self.alert_threshold_memory = float(os.getenv('ALERT_THRESHOLD_MEMORY', 85.0))
        self.alert_threshold_disk = float(os.getenv('ALERT_THRESHOLD_DISK', 90.0))
        self.health_check_timeout = int(os.getenv('HEALTH_CHECK_TIMEOUT', 10))
        self.alert_cooldown = int(os.getenv('ALERT_COOLDOWN', 300))  # 5 minutes

        # Alert destinations
        self.smtp_enabled = os.getenv('SMTP_ENABLED', 'false').lower() == 'true'
        self.admin_email = os.getenv('ADMIN_EMAIL', '')


class HealthChecker:
    """Checks application health"""

    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.last_alert_time = {}

    def check_health(self) -> Dict[str, Any]:
        """Check application health endpoint"""
        try:
            response = requests.get(
                f"{self.config.service_url}/health",
                timeout=self.config.health_check_timeout
            )

            return {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'status_code': response.status_code,
                'response_time_ms': response.elapsed.total_seconds() * 1000,
                'data': response.json() if response.status_code == 200 else None
            }
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'error': 'Health check timed out'
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unreachable',
                'error': 'Could not connect to service'
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    def check_metrics(self) -> Dict[str, Any]:
        """Get application metrics"""
        try:
            response = requests.get(
                f"{self.config.service_url}/metrics",
                timeout=self.config.health_check_timeout
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {'error': f'HTTP {response.status_code}'}
        except Exception as e:
            return {'error': str(e)}

    def should_alert(self, alert_type: str) -> bool:
        """Check if enough time has passed since last alert"""
        now = time.time()
        last_alert = self.last_alert_time.get(alert_type, 0)

        if now - last_alert >= self.config.alert_cooldown:
            self.last_alert_time[alert_type] = now
            return True

        return False


class ResourceMonitor:
    """Monitors system resources"""

    def __init__(self, config: MonitoringConfig):
        self.config = config

    def get_cpu_usage(self) -> float:
        """Get CPU usage percentage"""
        return psutil.cpu_percent(interval=1)

    def get_memory_usage(self) -> Dict[str, Any]:
        """Get memory usage"""
        memory = psutil.virtual_memory()
        return {
            'percent': memory.percent,
            'used_mb': round(memory.used / 1024 / 1024, 2),
            'total_mb': round(memory.total / 1024 / 1024, 2),
            'available_mb': round(memory.available / 1024 / 1024, 2)
        }

    def get_disk_usage(self) -> Dict[str, Any]:
        """Get disk usage"""
        disk = psutil.disk_usage('/')
        return {
            'percent': disk.percent,
            'used_gb': round(disk.used / 1024 / 1024 / 1024, 2),
            'total_gb': round(disk.total / 1024 / 1024 / 1024, 2),
            'free_gb': round(disk.free / 1024 / 1024 / 1024, 2)
        }

    def get_process_info(self) -> List[Dict[str, Any]]:
        """Get info about Python processes"""
        processes = []

        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                if 'python' in proc.info['name'].lower():
                    processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_percent': round(proc.info['memory_percent'], 2)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        return processes


class AlertManager:
    """Manages alerts and notifications"""

    def __init__(self, config: MonitoringConfig):
        self.config = config

    def send_alert(self, alert_type: str, message: str, severity: str = 'warning'):
        """Send alert notification"""
        logger.log(
            logging.WARNING if severity == 'warning' else logging.ERROR,
            f"ALERT [{alert_type}]: {message}"
        )

        # Send email if configured
        if self.config.smtp_enabled and self.config.admin_email:
            self._send_email_alert(alert_type, message, severity)

    def _send_email_alert(self, alert_type: str, message: str, severity: str):
        """Send email alert"""
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart()
            msg['From'] = os.getenv('SMTP_USERNAME', '')
            msg['To'] = self.config.admin_email
            msg['Subject'] = f"[{severity.upper()}] Arcane Codex Alert: {alert_type}"

            body = f"""
The Arcane Codex Monitoring System Alert

Alert Type: {alert_type}
Severity: {severity}
Time: {datetime.now().isoformat()}

Message:
{message}

---
Automated alert from The Arcane Codex monitoring system
"""

            msg.attach(MIMEText(body, 'plain'))

            # Send email
            with smtplib.SMTP(
                os.getenv('SMTP_HOST', 'smtp.gmail.com'),
                int(os.getenv('SMTP_PORT', 587))
            ) as server:
                if os.getenv('SMTP_USE_TLS', 'true').lower() == 'true':
                    server.starttls()

                server.login(
                    os.getenv('SMTP_USERNAME', ''),
                    os.getenv('SMTP_PASSWORD', '')
                )
                server.send_message(msg)

            logger.info(f"Email alert sent to {self.config.admin_email}")

        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")


class Monitor:
    """Main monitoring class"""

    def __init__(self):
        self.config = MonitoringConfig()
        self.health_checker = HealthChecker(self.config)
        self.resource_monitor = ResourceMonitor(self.config)
        self.alert_manager = AlertManager(self.config)

    def check_all(self) -> Dict[str, Any]:
        """Run all monitoring checks"""
        logger.info("Running monitoring checks...")

        # Health check
        health = self.health_checker.check_health()
        logger.info(f"Health: {health['status']}")

        # Resource checks
        cpu = self.resource_monitor.get_cpu_usage()
        memory = self.resource_monitor.get_memory_usage()
        disk = self.resource_monitor.get_disk_usage()
        processes = self.resource_monitor.get_process_info()

        logger.info(f"CPU: {cpu}% | Memory: {memory['percent']}% | Disk: {disk['percent']}%")

        # Check thresholds and alert
        self._check_thresholds(health, cpu, memory, disk)

        return {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'health': health,
            'resources': {
                'cpu': cpu,
                'memory': memory,
                'disk': disk
            },
            'processes': processes
        }

    def _check_thresholds(self, health, cpu, memory, disk):
        """Check if metrics exceed thresholds and alert"""

        # Health check
        if health['status'] != 'healthy':
            if self.health_checker.should_alert('health'):
                self.alert_manager.send_alert(
                    'health_check_failed',
                    f"Service health check failed: {health.get('error', health['status'])}",
                    'critical'
                )

        # CPU usage
        if cpu > self.config.alert_threshold_cpu:
            if self.health_checker.should_alert('cpu'):
                self.alert_manager.send_alert(
                    'high_cpu_usage',
                    f"CPU usage is {cpu}% (threshold: {self.config.alert_threshold_cpu}%)",
                    'warning'
                )

        # Memory usage
        if memory['percent'] > self.config.alert_threshold_memory:
            if self.health_checker.should_alert('memory'):
                self.alert_manager.send_alert(
                    'high_memory_usage',
                    f"Memory usage is {memory['percent']}% (threshold: {self.config.alert_threshold_memory}%)",
                    'warning'
                )

        # Disk usage
        if disk['percent'] > self.config.alert_threshold_disk:
            if self.health_checker.should_alert('disk'):
                self.alert_manager.send_alert(
                    'high_disk_usage',
                    f"Disk usage is {disk['percent']}% (threshold: {self.config.alert_threshold_disk}%)",
                    'critical'
                )

    def run_continuous(self):
        """Run monitoring continuously"""
        logger.info(f"Starting continuous monitoring (interval: {self.config.check_interval}s)")

        while True:
            try:
                results = self.check_all()

                # Optionally write results to file
                results_file = '/var/log/arcane-codex/monitor_results.json'
                with open(results_file, 'w') as f:
                    json.dump(results, f, indent=2)

            except Exception as e:
                logger.error(f"Monitoring check failed: {e}", exc_info=True)

            time.sleep(self.config.check_interval)


def main():
    """Main entry point"""
    logger.info("=" * 80)
    logger.info("The Arcane Codex - Production Monitoring")
    logger.info("=" * 80)

    monitor = Monitor()

    # Run once or continuously
    if '--once' in sys.argv:
        results = monitor.check_all()
        print(json.dumps(results, indent=2))
    else:
        monitor.run_continuous()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Monitoring stopped by user")
        sys.exit(0)
