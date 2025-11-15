    async def generate_interrogation_question(
        self,
        player_id: str,
        question_number: int,
        previous_answers: List[Dict] = None
    ) -> Dict:
        """Generate unique Divine Interrogation question using MCP"""
        server_params = StdioServerParameters(
            command="python",
            args=[self.server_script_path]
        )

        # Create fresh connection for this call
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                # Format request
                request_data = {
                    "player_id": player_id,
                    "question_number": question_number,
                    "previous_answers": previous_answers or [],
                    "gods": ["VALDRIS", "KAITHA", "MORVANE", "SYLARA", "KORVAN", "ATHENA", "MERCUS"]
                }
                
                # Call MCP tool
                result = await session.call_tool(
                    "generate_interrogation_question",
                    arguments=request_data
                )
                
                # Parse response
                if result and result.content:
                    question_text = result.content[0].text if result.content else "{}"
                    try:
                        return json.loads(question_text)
                    except json.JSONDecodeError:
                        raise RuntimeError(f"Failed to parse MCP response: {question_text}")
                
                raise RuntimeError("Failed to generate interrogation question via MCP")
