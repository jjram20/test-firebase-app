from locust import HttpUser, task, between

PAYLOAD = {
    "language": "python",
    "version": "*",
    "files": [
        {
            "name": "main.py",
            "content": "print('Hola desde Locust')"
        }
    ]
}


class PistonUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def execute_python(self):
        with self.client.post(
            "/",
            json=PAYLOAD,
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(response.text)