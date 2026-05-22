/* ==========================================================================
   Antigravity Premium OnePlus Earbuds Engine - Core Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Vector Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ==========================================================================
    // 1. Core State Management (E-Commerce soundstage)
    // ==========================================================================
    const State = {
        selectedColor: 'obsidian', // obsidian, crimson, spark
        quantity: 1,
        basePrice: 199.00,
        couponApplied: false,
        couponDiscountRate: 0.15, // 15% discount
        couponCode: "ONEPLUSRED",
        cart: [],
        paymentMethod: 'visa', // upi, phonepe, gpay, paytm, visa, mastercard, applepay
        checkoutStep: 1, // 1: Address form, 2: Payment Gateway
        ancMode: 'off', // off, on
        activeGesture: 'none',
        reviewsIndex: 0
    };

    // Color definitions for UI text and 3D materials
    const ColorPalette = {
        obsidian: {
            name: "Matte Obsidian",
            primaryHex: "#1a1a20",
            accentHex: "#ff123f",
            isMetallic: true,
            roughness: 0.5,
            metalness: 0.85
        },
        crimson: {
            name: "Crimson Pulse",
            primaryHex: "#ff123f",
            accentHex: "#ffffff",
            isMetallic: true,
            roughness: 0.22,
            metalness: 0.90
        },
        spark: {
            name: "Platinum Spark",
            primaryHex: "#f8fafc",
            accentHex: "#ff123f",
            isMetallic: true,
            roughness: 0.3,
            metalness: 0.95
        }
    };

    // ==========================================================================
    // 2. Cinematic Loading Screen & Setup
    // ==========================================================================
    const runLoader = () => {
        const loader = document.getElementById('loader');
        const loaderBar = document.getElementById('loader-bar');
        const loaderPercent = document.getElementById('loader-percent');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Hide Loader with elegant fade
                setTimeout(() => {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                    
                    // Trigger GSAP Initial Entrance Transitions
                    triggerEntranceAnimations();
                }, 400);
            }
            loaderBar.style.width = `${progress}%`;
            loaderPercent.textContent = `${progress}%`;
        }, 60);
    };

    // ==========================================================================
    // 3. Custom Glowing Cursor Trails
    // ==========================================================================
    const initCursorGlow = () => {
        const glow = document.getElementById('cursor-glow');
        if (!glow) return;
        
        let cursorX = 0;
        let cursorY = 0;
        let glowX = 0;
        let glowY = 0;
        
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            
            if (glow.style.opacity === '0' || glow.style.opacity === '') {
                glow.style.opacity = '1';
            }
        });

        // Smooth trailing calculation
        const updateGlowPosition = () => {
            const dx = cursorX - glowX;
            const dy = cursorY - glowY;
            glowX += dx * 0.1;
            glowY += dy * 0.1;
            
            glow.style.left = `${glowX}px`;
            glow.style.top = `${glowY}px`;
            
            requestAnimationFrame(updateGlowPosition);
        };
        updateGlowPosition();

        // Expand glow on hovering interactive nodes
        const hoverables = document.querySelectorAll('button, a, .swatch, .gesture-item, .payment-icon-card, textarea, input');
        hoverables.forEach(node => {
            node.addEventListener('mouseenter', () => {
                glow.style.width = '450px';
                glow.style.height = '450px';
                glow.style.background = 'radial-gradient(circle, rgba(235, 0, 40, 0.14) 0%, rgba(235, 0, 40, 0) 70%)';
            });
            node.addEventListener('mouseleave', () => {
                glow.style.width = '300px';
                glow.style.height = '300px';
                glow.style.background = 'radial-gradient(circle, rgba(235, 0, 40, 0.08) 0%, rgba(235, 0, 40, 0) 70%)';
            });
        });
    };

    // ==========================================================================
    // 4. Floating Particles Canvas System
    // ==========================================================================
    const initBackgroundParticles = () => {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        const particles = [];
        const maxParticles = 45;
        
        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height + height; // Start below visible zone
                this.size = Math.random() * 2 + 1;
                this.speedY = -(Math.random() * 0.7 + 0.2);
                this.speedX = Math.random() * 0.4 - 0.2;
                this.alpha = Math.random() * 0.4 + 0.15;
                this.color = Math.random() > 0.3 ? '#ff123f' : '#8e8e93'; // Neon scarlet or carbon gray
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Slowly fade out near top
                if (this.y < 100) {
                    this.alpha -= 0.005;
                }
                
                // Reset if completely out of bounds or invisible
                if (this.y < 0 || this.alpha <= 0 || this.x < 0 || this.x > width) {
                    this.reset();
                }
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                
                // Add soft glowing overlay for red particles
                if (this.color === '#ff123f') {
                    ctx.shadowColor = '#ff123f';
                    ctx.shadowBlur = 8;
                }
                
                ctx.fill();
                ctx.restore();
            }
        }
        
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
            // Randomize starting heights initially so they are spread out
            particles[i].y = Math.random() * height;
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        };
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        
        animate();
    };

    // ==========================================================================
    // 5. High-Fidelity Three.js 3D earbud Scene Builder
    // ==========================================================================
    let heroScene, heroCamera, heroRenderer, heroBudGroup;
    let showcaseScene, showcaseCamera, showcaseRenderer, showcaseBudGroup;
    
    // Core Mesh builder function
    const create3DEarbudMesh = (colorConfig) => {
        const earbudGroup = new THREE.Group();
        
        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorConfig.primaryHex),
            roughness: colorConfig.roughness,
            metalness: colorConfig.metalness,
            envMapIntensity: 1.5
        });
        
        const accentMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorConfig.accentHex),
            roughness: 0.1,
            metalness: 0.9,
            emissive: new THREE.Color(colorConfig.accentHex),
            emissiveIntensity: colorConfig.selectedColor === 'crimson' ? 0.3 : 1.8
        });
        
        const tipMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorConfig.selectedColor === 'spark' ? '#cccccc' : '#222222'),
            roughness: 0.9,
            metalness: 0.1
        });

        // 1. Sound Cavity Main Head (Rounded Sphere / capsule shape)
        const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
        headGeo.scale(1.2, 1, 1); // Squish slightly to represent ergonomic design
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.position.set(0, 0.4, 0);
        earbudGroup.add(headMesh);
        
        // 2. Silicone Ear Tip (Angled dome structure)
        const tipGeo = new THREE.CylinderGeometry(0.5, 0.9, 0.7, 32);
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.position.set(-1.1, 0.4, 0.4);
        tipMesh.rotation.z = Math.PI / 4;
        tipMesh.rotation.y = -Math.PI / 6;
        earbudGroup.add(tipMesh);
        
        // 3. Earbud Stem (Cylinder trailing down)
        const stemGeo = new THREE.CylinderGeometry(0.35, 0.28, 2.2, 32);
        const stemMesh = new THREE.Mesh(stemGeo, bodyMat);
        stemMesh.position.set(0.3, -0.7, 0.1);
        stemMesh.rotation.z = -Math.PI / 18; // Slight ergonomic tilt
        earbudGroup.add(stemMesh);
        
        // 4. Futuristic Emissive Strip on Stem (Glowing indicators)
        const stripGeo = new THREE.BoxGeometry(0.08, 1.2, 0.12);
        const stripMesh = new THREE.Mesh(stripGeo, accentMat);
        stripMesh.position.set(0.66, -0.6, 0.15);
        stripMesh.rotation.z = -Math.PI / 18;
        earbudGroup.add(stripMesh);

        // 5. Sound Outlet Mesh (Charging coordinates plate)
        const plateGeo = new THREE.CircleGeometry(0.2, 16);
        const plateMesh = new THREE.Mesh(plateGeo, tipMat);
        plateMesh.position.set(0.22, -1.8, 0.12);
        plateMesh.rotation.x = Math.PI / 2;
        earbudGroup.add(plateMesh);
        
        return earbudGroup;
    };

    const initHero3D = () => {
        const container = document.getElementById('three-canvas-container');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Setup Scene
        heroScene = new THREE.Scene();
        
        // Camera
        heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        heroCamera.position.set(0, 0, 7.5);
        
        // Renderer
        heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        heroRenderer.setSize(width, height);
        heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        heroRenderer.shadowMap.enabled = true;
        container.appendChild(heroRenderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        heroScene.add(ambientLight);
        
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
        keyLight.position.set(5, 8, 5);
        heroScene.add(keyLight);
        
        const redFillLight = new THREE.PointLight(0xff123f, 3.5, 10);
        redFillLight.position.set(-4, -2, 2);
        heroScene.add(redFillLight);
        
        const cyanBackLight = new THREE.PointLight(0x00f0ff, 2.2, 10);
        cyanBackLight.position.set(2, 4, -4);
        heroScene.add(cyanBackLight);
        
        // Construct Pair of buds
        heroBudGroup = new THREE.Group();
        
        const leftBud = create3DEarbudMesh(ColorPalette[State.selectedColor]);
        leftBud.position.set(-1.2, 0.4, 0);
        leftBud.rotation.y = Math.PI / 5;
        
        const rightBud = create3DEarbudMesh(ColorPalette[State.selectedColor]);
        rightBud.position.set(1.2, -0.4, -0.5);
        rightBud.rotation.y = -Math.PI / 3;
        rightBud.rotation.x = Math.PI / 8;
        
        heroBudGroup.add(leftBud);
        heroBudGroup.add(rightBud);
        heroScene.add(heroBudGroup);
        
        // Mouse Hover Parallax Mechanics
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        
        document.addEventListener('mousemove', (e) => {
            const normX = (e.clientX / window.innerWidth) - 0.5;
            const normY = (e.clientY / window.innerHeight) - 0.5;
            targetX = normX * 0.4;
            targetY = normY * 0.3;
        });

        // Animation Loop
        const animate = () => {
            // Subtle standard rotations
            leftBud.rotation.y += 0.003;
            rightBud.rotation.y += 0.002;
            rightBud.rotation.z += 0.001;
            
            // Mouse smoothing (damping)
            currentX += (targetX - currentX) * 0.05;
            currentY += (targetY - currentY) * 0.05;
            
            heroBudGroup.rotation.y = currentX;
            heroBudGroup.rotation.x = currentY;
            
            heroRenderer.render(heroScene, heroCamera);
            requestAnimationFrame(animate);
        };
        
        animate();
    };

    const initShowcase3D = () => {
        const container = document.getElementById('showcase-three-canvas');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Setup Scene
        showcaseScene = new THREE.Scene();
        
        // Camera
        showcaseCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        showcaseCamera.position.set(0, 0.5, 6);
        
        // Renderer
        showcaseRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        showcaseRenderer.setSize(width, height);
        showcaseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(showcaseRenderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        showcaseScene.add(ambientLight);
        
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
        keyLight.position.set(3, 10, 5);
        showcaseScene.add(keyLight);
        
        const redPoint = new THREE.PointLight(0xff123f, 4.5, 12);
        redPoint.position.set(4, -3, 3);
        showcaseScene.add(redPoint);
        
        const bluePoint = new THREE.PointLight(0x00f0ff, 2.5, 10);
        bluePoint.position.set(-4, 2, -3);
        showcaseScene.add(bluePoint);
        
        // Showcase dynamic group (single prominent earbud)
        showcaseBudGroup = new THREE.Group();
        const singleBud = create3DEarbudMesh(ColorPalette[State.selectedColor]);
        singleBud.scale.set(1.2, 1.2, 1.2);
        showcaseBudGroup.add(singleBud);
        showcaseScene.add(showcaseBudGroup);
        
        // Drag rotation setup
        let isDragging = false;
        let prevMouseX = 0;
        let targetRotationY = 0;
        const hudAngle = document.getElementById('hud-angle');
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevMouseX;
            prevMouseX = e.clientX;
            
            targetRotationY += deltaX * 0.007;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch Drag supports
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            prevMouseX = e.touches[0].clientX;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const deltaX = e.touches[0].clientX - prevMouseX;
            prevMouseX = e.touches[0].clientX;
            
            targetRotationY += deltaX * 0.007;
        });
        
        container.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Render loop
        const animate = () => {
            // Apply drag rotations with damping
            showcaseBudGroup.rotation.y += (targetRotationY - showcaseBudGroup.rotation.y) * 0.1;
            
            // Subtle base bobbing animation
            showcaseBudGroup.position.y = Math.sin(Date.now() * 0.001) * 0.15;
            
            // HUD Angle output
            if (hudAngle) {
                const degrees = Math.round(((showcaseBudGroup.rotation.y % (Math.PI * 2)) * 180) / Math.PI);
                const normalizedDeg = degrees < 0 ? 360 + degrees : degrees;
                hudAngle.textContent = `ANGL: ${normalizedDeg}°`;
            }
            
            showcaseRenderer.render(showcaseScene, showcaseCamera);
            requestAnimationFrame(animate);
        };
        animate();
    };

    // Global resize handler for both 3D canvases
    window.addEventListener('resize', () => {
        if (heroRenderer) {
            const heroCont = document.getElementById('three-canvas-container');
            const w = heroCont.clientWidth;
            const h = heroCont.clientHeight;
            heroCamera.aspect = w / h;
            heroCamera.updateProjectionMatrix();
            heroRenderer.setSize(w, h);
        }
        if (showcaseRenderer) {
            const showCont = document.getElementById('showcase-three-canvas');
            const w = showCont.clientWidth;
            const h = showCont.clientHeight;
            showcaseCamera.aspect = w / h;
            showcaseCamera.updateProjectionMatrix();
            showcaseRenderer.setSize(w, h);
        }
    });

    // Morph Materials when Swatches are toggled
    const morph3DMaterials = (colorKey) => {
        const config = ColorPalette[colorKey];
        if (!config) return;
        
        // Traverse and rebuild materials on both models
        const updateModelMaterials = (group) => {
            if (!group) return;
            group.traverse((child) => {
                if (child.isMesh) {
                    const materialName = child.geometry.type;
                    
                    // Remap body geometry elements (Spheres and cylinders)
                    if (materialName.includes('Sphere') || (materialName.includes('Cylinder') && child.position.y < -0.1)) {
                        child.material.color.set(config.primaryHex);
                        child.material.roughness = config.roughness;
                        child.material.metalness = config.metalness;
                    }
                    
                    // Emissive Glowing line
                    if (materialName.includes('Box')) {
                        child.material.color.set(config.accentHex);
                        child.material.emissive.set(config.accentHex);
                        child.material.emissiveIntensity = colorKey === 'crimson' ? 0.3 : 1.8;
                    }
                }
            });
        };
        
        updateModelMaterials(heroBudGroup);
        updateModelMaterials(showcaseBudGroup);
    };

    // ==========================================================================
    // 6. Interactive Active Noise Cancellation (ANC Waveform)
    // ==========================================================================
    const initANCWaveform = () => {
        const ambientWave = document.getElementById('ambient-wave');
        const antiWave = document.getElementById('anti-wave');
        if (!ambientWave || !antiWave) return;
        
        let animationFrameId;
        let phase = 0;
        let currentAmplitude = 30; // Max visual amplitude
        let targetAmplitude = 30; // Dynamic goal (flattens on ANC ON)
        
        const drawWaves = () => {
            phase += 0.08;
            
            // Dampen current amplitude towards target
            const delta = targetAmplitude - currentAmplitude;
            currentAmplitude += delta * 0.08;
            
            let ambientPath = '';
            let antiPath = '';
            
            // Build dynamic SVG paths
            for (let x = 0; x <= 500; x += 5) {
                // Wave calculations
                const angle = (x * 0.035) + phase;
                
                // Ambient Noise wave (Neon Red)
                const yAmbient = 60 + Math.sin(angle) * currentAmplitude;
                
                // Anti-noise wave (Perfect mirror phase shift of PI, Neon Cyan)
                const yAnti = 60 + Math.sin(angle + Math.PI) * currentAmplitude;
                
                if (x === 0) {
                    ambientPath += `M ${x} ${yAmbient}`;
                    antiPath += `M ${x} ${yAnti}`;
                } else {
                    ambientPath += ` L ${x} ${yAmbient}`;
                    antiPath += ` L ${x} ${yAnti}`;
                }
            }
            
            ambientWave.setAttribute('d', ambientPath);
            antiWave.setAttribute('d', antiPath);
            
            animationFrameId = requestAnimationFrame(drawWaves);
        };
        
        drawWaves();

        // Hook Interactive Switches
        const btnOff = document.getElementById('btn-anc-off');
        const btnOn = document.getElementById('btn-anc-on');
        const ancCard = document.getElementById('anc-card');
        
        if (btnOff && btnOn) {
            btnOff.addEventListener('click', () => {
                btnOn.classList.remove('active');
                btnOff.classList.add('active');
                targetAmplitude = 30; // Reactivate heavy waveform
                State.ancMode = 'off';
                
                // Card visual changes
                if (ancCard) {
                    ancCard.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                    ancCard.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
                }
            });
            
            btnOn.addEventListener('click', () => {
                btnOff.classList.remove('active');
                btnOn.classList.add('active');
                targetAmplitude = 0; // Flatten waveform completely represent silence
                State.ancMode = 'on';
                
                if (ancCard) {
                    ancCard.style.borderColor = 'rgba(0, 240, 255, 0.45)';
                    ancCard.style.boxShadow = '0 15px 40px rgba(0, 240, 255, 0.15)';
                }
            });
        }
    };

    // ==========================================================================
    // 7. Spatial Audio Radar Simulator
    // ==========================================================================
    const initSpatialRadar = () => {
        const radar = document.getElementById('spatial-radar-grid');
        const nodes = document.querySelectorAll('.radar-audio-node');
        if (!radar || !nodes) return;
        
        radar.addEventListener('mousemove', (e) => {
            const rect = radar.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Push coordinates in 3D grid layout coordinates representation
            const coordX = Math.round(((mouseX / rect.width) - 0.5) * 100);
            const coordY = Math.round(((mouseY / rect.height) - 0.5) * -100);
            
            // Add custom micro-attractions to nearest nodes
            nodes.forEach(node => {
                const nodeX = parseFloat(node.style.left);
                const nodeY = parseFloat(node.style.top);
                
                const percentX = (mouseX / rect.width) * 100;
                const percentY = (mouseY / rect.height) * 100;
                
                const dist = Math.sqrt(Math.pow(percentX - nodeX, 2) + Math.pow(percentY - nodeY, 2));
                
                // Node pulsate and expand slightly on mouse approaches
                if (dist < 15) {
                    node.style.transform = 'translate(-50%, -50%) scale(1.35)';
                    node.style.backgroundColor = 'rgba(0, 240, 255, 0.55)';
                    node.style.borderColor = '#00f0ff';
                } else {
                    node.style.transform = 'translate(-50%, -50%) scale(1)';
                    node.style.backgroundColor = 'rgba(255, 18, 63, 0.35)';
                    node.style.borderColor = '#ff123f';
                }
            });
        });

        // Toggle sound source coordinates trigger
        nodes.forEach(node => {
            node.addEventListener('click', () => {
                node.style.transform = 'translate(-50%, -50%) scale(1.6)';
                setTimeout(() => {
                    node.style.transform = 'translate(-50%, -50%) scale(1.2)';
                }, 300);
            });
        });
    };

    // ==========================================================================
    // 8. Smart Touch Gestures Interface map
    // ==========================================================================
    const initTouchGestures = () => {
        const items = document.querySelectorAll('.gesture-item');
        const sensor = document.getElementById('svg-touch-sensor');
        const hud = document.getElementById('touch-hud-message');
        if (!items || !hud) return;
        
        const feedbackMessages = {
            single: "TAP DETECTED -> PAUSING SONIC ENGINE",
            double: "DOUBLE TAP DETECTED -> SKIPPING TRACK FORWARD",
            triple: "TRIPLE TAP DETECTED -> RETURNING PREVIOUS TRACK",
            hold: "LONG HOLD DETECTED -> ADAPTIVE ANC ENGAGED"
        };
        
        let clickTimeout;
        
        items.forEach(item => {
            // Hover Simulation
            item.addEventListener('mouseenter', () => {
                // If a click simulation is active, don't interrupt it
                if (clickTimeout) return;
                
                const gesture = item.getAttribute('data-gesture');
                
                // Highlight active items
                items.forEach(i => i.classList.remove('active-gesture'));
                item.classList.add('active-gesture');
                
                // Update HUD indicator
                hud.textContent = feedbackMessages[gesture] || "SYSTEM ENGAGED";
                hud.style.color = '#ff123f';
                hud.style.boxShadow = '0 0 15px rgba(255, 18, 63, 0.3)';
                
                // Expand sensor highlight ring
                if (sensor) {
                    sensor.setAttribute('fill', 'rgba(255, 18, 63, 0.4)');
                    sensor.setAttribute('stroke', '#ff123f');
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (clickTimeout) return;
                
                item.classList.remove('active-gesture');
                hud.textContent = "READY FOR INPUT";
                hud.style.color = '#00f0ff';
                hud.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
                
                if (sensor) {
                    sensor.setAttribute('fill', 'rgba(255, 18, 63, 0.12)');
                    sensor.setAttribute('stroke', '#ff123f');
                }
            });

            // Click Interaction Integration (Single/Double/Triple/Hold)
            item.addEventListener('click', () => {
                const gesture = item.getAttribute('data-gesture');
                
                // Clear any existing active timeout
                if (clickTimeout) clearTimeout(clickTimeout);
                
                // Highlight active item
                items.forEach(i => i.classList.remove('active-gesture'));
                item.classList.add('active-gesture');
                
                // Set state
                State.activeGesture = gesture;
                
                // Update HUD with intense glow
                hud.textContent = feedbackMessages[gesture] || "SYSTEM ENGAGED";
                hud.style.color = '#ff123f';
                hud.style.boxShadow = '0 0 25px rgba(255, 18, 63, 0.6)';
                
                // Pulsate the touch sensor vector circle
                if (sensor) {
                    sensor.setAttribute('fill', 'rgba(255, 18, 63, 0.75)');
                    sensor.setAttribute('stroke', '#ff123f');
                    sensor.style.transform = 'scale(1.35)';
                    sensor.style.transformOrigin = 'center';
                    sensor.style.transition = 'transform 0.08s ease-out';
                    
                    setTimeout(() => {
                        sensor.style.transform = 'scale(1)';
                    }, 100);
                }
                
                // Lock HUD feedback for 2 seconds before resetting to Ready
                clickTimeout = setTimeout(() => {
                    clickTimeout = null;
                    item.classList.remove('active-gesture');
                    hud.textContent = "READY FOR INPUT";
                    hud.style.color = '#00f0ff';
                    hud.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
                    
                    if (sensor) {
                        sensor.setAttribute('fill', 'rgba(255, 18, 63, 0.12)');
                        sensor.setAttribute('stroke', '#ff123f');
                    }
                }, 2000);
            });
        });
    };

    // ==========================================================================
    // 9. Premium E-Commerce Cart, Drawer & Forms Processor
    // ==========================================================================
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const cartEmpty = document.getElementById('cart-empty');
    const cartContent = document.getElementById('cart-content-wrapper');
    const cartBadge = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const addCartBtn = document.getElementById('purchase-add-cart');

    // Navigation and drawer controllers
    const openCartDrawer = () => {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
    };
    
    const closeCartDrawer = () => {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
    };

    if (cartTrigger) cartTrigger.addEventListener('click', openCartDrawer);
    if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // Proceed to Checkout button linkage
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            // Close side drawer drawer
            closeCartDrawer();
            
            // Navigate smoothly to purchase node
            const purchaseSection = document.getElementById('purchase');
            if (purchaseSection) {
                purchaseSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Color Swatch Selectors (Showcase & Purchase sides mirrored)
    const setupColorPickers = () => {
        const swatches = document.querySelectorAll('.swatch');
        const colorLabel = document.getElementById('selected-color-label');
        const purchasePrice = document.getElementById('checkout-price');
        
        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const colorKey = swatch.getAttribute('data-color');
                State.selectedColor = colorKey;
                
                // Highlight swatches
                swatches.forEach(s => s.classList.remove('active-swatch'));
                document.querySelectorAll(`.swatch.color-${colorKey}`).forEach(s => {
                    s.classList.add('active-swatch');
                });
                
                // Update UI Labels
                if (colorLabel) {
                    colorLabel.textContent = ColorPalette[colorKey].name;
                }
                
                // Trigger 3D Material Morphings
                morph3DMaterials(colorKey);
            });
        });
    };

    // Quantity selectors logic
    const setupQtyControllers = () => {
        const btnMinus = document.getElementById('qty-minus');
        const btnPlus = document.getElementById('qty-plus');
        const qtyVal = document.getElementById('qty-val');
        
        if (btnMinus && btnPlus && qtyVal) {
            btnMinus.addEventListener('click', () => {
                if (State.quantity > 1) {
                    State.quantity--;
                    qtyVal.textContent = State.quantity;
                }
            });
            btnPlus.addEventListener('click', () => {
                State.quantity++;
                qtyVal.textContent = State.quantity;
            });
        }
    };

    // Apply shopping cart dynamic logic
    const updateCartUI = () => {
        // Badges
        const totalItemsCount = State.cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartBadge) {
            cartBadge.textContent = totalItemsCount;
            // Pulsate badge
            cartBadge.classList.add('animate-pulse');
            setTimeout(() => cartBadge.classList.remove('animate-pulse'), 500);
        }

        if (State.cart.length === 0) {
            if (cartEmpty) cartEmpty.classList.remove('hidden');
            if (cartContent) cartContent.classList.add('hidden');
            return;
        }

        if (cartEmpty) cartEmpty.classList.add('hidden');
        if (cartContent) cartContent.classList.remove('hidden');

        // Draw items
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            State.cart.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                
                const variantHex = ColorPalette[item.color].primaryHex;
                const variantName = ColorPalette[item.color].name;
                const itemTotalPrice = (item.qty * item.price).toFixed(2);
                
                itemEl.innerHTML = `
                    <div class="item-thumb">
                        <div class="item-thumb-inner" style="background-color: ${variantHex};"></div>
                    </div>
                    <div class="item-info">
                        <h4>OnePlus Buds Neo</h4>
                        <span class="item-variant">${variantName}</span>
                        <div class="item-price-qty">
                            <span class="item-price">$${itemTotalPrice}</span>
                            <div class="item-qty-control">
                                <span class="item-qty-btn decrease-qty" data-index="${index}"><i data-lucide="minus" class="mini-icon"></i>-</span>
                                <span class="item-qty-val">${item.qty}</span>
                                <span class="item-qty-btn increase-qty" data-index="${index}"><i data-lucide="plus" class="mini-icon"></i>+</span>
                            </div>
                        </div>
                    </div>
                    <button class="item-remove remove-item-btn" data-index="${index}" aria-label="Remove Item">✕</button>
                `;
                
                cartItemsContainer.appendChild(itemEl);
            });
            
            // Attach small inline action events
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    State.cart.splice(idx, 1);
                    updateCartUI();
                });
            });

            document.querySelectorAll('.decrease-qty').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    if (State.cart[idx].qty > 1) {
                        State.cart[idx].qty--;
                    } else {
                        State.cart.splice(idx, 1);
                    }
                    updateCartUI();
                });
            });

            document.querySelectorAll('.increase-qty').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    State.cart[idx].qty++;
                    updateCartUI();
                });
            });
        }

        // Calculate Pricing Columns
        const subtotal = State.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let discount = 0;
        if (State.couponApplied) {
            discount = subtotal * State.couponDiscountRate;
            document.getElementById('summary-discount-row').classList.remove('hidden');
        } else {
            document.getElementById('summary-discount-row').classList.add('hidden');
        }
        
        const finalTotal = subtotal - discount;
        
        document.getElementById('summary-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('summary-discount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `$${finalTotal.toFixed(2)}`;

        // Update pricing details inside Checkout section side pane too
        document.getElementById('tally-base').textContent = `$${subtotal.toFixed(2)}`;
        if (State.couponApplied) {
            document.getElementById('tally-discount-line').classList.remove('hidden');
            document.getElementById('tally-discount').textContent = `-$${discount.toFixed(2)}`;
        } else {
            document.getElementById('tally-discount-line').classList.add('hidden');
        }
        document.getElementById('tally-total').textContent = `$${finalTotal.toFixed(2)}`;
    };

    // Add Cart button coordinates engagement
    if (addCartBtn) {
        addCartBtn.addEventListener('click', () => {
            // Find existing matching color item
            const existingItem = State.cart.find(item => item.color === State.selectedColor);
            if (existingItem) {
                existingItem.qty += State.quantity;
            } else {
                State.cart.push({
                    color: State.selectedColor,
                    qty: State.quantity,
                    price: State.basePrice
                });
            }
            
            // Reset base settings
            State.quantity = 1;
            const qtyVal = document.getElementById('qty-val');
            if (qtyVal) qtyVal.textContent = "1";
            
            updateCartUI();
            
            // Slide open cart drawer for immediate response
            setTimeout(openCartDrawer, 200);
        });
    }

    // Coupon logic
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-input');
    const couponMsg = document.getElementById('coupon-message');

    if (applyCouponBtn && couponInput && couponMsg) {
        applyCouponBtn.addEventListener('click', () => {
            const inputVal = couponInput.value.trim().toUpperCase();
            
            if (inputVal === State.couponCode) {
                State.couponApplied = true;
                couponMsg.textContent = "PROMO ENGAGED: 15% DISCOUNT SECURED";
                couponMsg.className = "coupon-msg success";
                couponInput.disabled = true;
                applyCouponBtn.disabled = true;
                
                updateCartUI();
            } else {
                couponMsg.textContent = "INVALID ACCESS SIGNATURE";
                couponMsg.className = "coupon-msg error";
            }
        });
    }

    // Step-by-Step Checkout coordinations and DOM elements
    const addressForm = document.getElementById('delivery-address-form');
    const paymentPanel = document.getElementById('payment-execution-panel');
    const stepLbl1 = document.getElementById('step-lbl-1');
    const stepLbl2 = document.getElementById('step-lbl-2');
    const stepLine = document.getElementById('step-line-1');
    const editAddressBtn = document.getElementById('edit-address-trigger');
    const paymentBackBtn = document.getElementById('payment-back-btn');

    // Return to Step 1: Address Input
    const returnToStep1 = () => {
        if (stepLbl1) stepLbl1.className = "step-circle active-step";
        if (stepLine) stepLine.className = "step-line";
        if (stepLbl2) stepLbl2.className = "step-circle";
        
        if (paymentPanel) paymentPanel.classList.add('hidden');
        if (addressForm) addressForm.classList.remove('hidden');
        
        State.checkoutStep = 1;
    };

    // Transition to Step 2: Payment Execution Panel
    const goToStep2 = () => {
        // Automatically populate cart if empty so the checkout is fully unlocked
        if (State.cart.length === 0) {
            State.cart.push({
                color: State.selectedColor,
                qty: State.quantity || 1,
                price: State.basePrice
            });
            State.quantity = 1;
            const qtyVal = document.getElementById('qty-val');
            if (qtyVal) qtyVal.textContent = "1";
            updateCartUI();
        }

        // Auto-fill address details if they are empty
        const nameInput = document.getElementById('cust-name');
        const emailInput = document.getElementById('cust-email');
        const addrInput = document.getElementById('cust-address');
        
        if (nameInput && !nameInput.value.trim()) {
            nameInput.value = nameInput.placeholder || "Aiden Mercer";
        }
        if (emailInput && !emailInput.value.trim()) {
            emailInput.value = emailInput.placeholder || "aiden@cyber.net";
        }
        if (addrInput && !addrInput.value.trim()) {
            addrInput.value = addrInput.placeholder || "Grid Alpha-12, Cyberpunk Heights, Sector 7";
        }

        const name = nameInput ? nameInput.value : "";
        const addr = addrInput ? addrInput.value : "";
        
        // Populate Address Recap pane
        const recapName = document.getElementById('recap-name');
        const recapAddr = document.getElementById('recap-addr');
        if (recapName) recapName.textContent = name;
        if (recapAddr) recapAddr.textContent = addr;
        
        // Anim step HUD
        if (stepLbl1) stepLbl1.className = "step-circle completed-step";
        if (stepLine) stepLine.className = "step-line completed-line";
        if (stepLbl2) stepLbl2.className = "step-circle active-step";
        
        // Morph forms
        if (addressForm) addressForm.classList.add('hidden');
        if (paymentPanel) paymentPanel.classList.remove('hidden');
        
        State.checkoutStep = 2;
    };

    // Payment selectors click glow updates & Direct step access
    const payCards = document.querySelectorAll('.payment-icon-card');
    const activePayHUDName = document.getElementById('active-payment-name');
    
    payCards.forEach(card => {
        card.addEventListener('click', () => {
            payCards.forEach(c => c.classList.remove('selected-pay-card'));
            card.classList.add('selected-pay-card');
            
            const payKey = card.getAttribute('data-payment');
            State.paymentMethod = payKey;
            
            // Highlight name on HUD
            const namesMapping = {
                upi: "UPI Direct Secure Node",
                phonepe: "PhonePe Transmit Pipeline",
                gpay: "Google Pay Biometric Gateway",
                paytm: "Paytm Sync Protocol",
                visa: "Visa Secured Encrypted Channel",
                mastercard: "Mastercard Secured Encrypted Channel",
                applepay: "Apple Pay Holographic Sync"
            };
            
            if (activePayHUDName) {
                activePayHUDName.textContent = namesMapping[payKey] || "Biometric Secured Gateway";
            }

            // Instantly transition to Step 2 showing the payment method active!
            goToStep2();
        });
    });

    if (addressForm && paymentPanel) {
        // Validate Address submit (Move to Step 2)
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            goToStep2();
        });

        if (editAddressBtn) editAddressBtn.addEventListener('click', returnToStep1);
        if (paymentBackBtn) paymentBackBtn.addEventListener('click', returnToStep1);
    }

    // Add pointer cursors and click actions to the progress steps
    if (stepLbl1 && stepLbl2) {
        stepLbl1.style.cursor = 'pointer';
        stepLbl2.style.cursor = 'pointer';
        
        stepLbl1.addEventListener('click', () => {
            if (State.checkoutStep === 2) {
                returnToStep1();
            }
        });
        
        stepLbl2.addEventListener('click', () => {
            if (State.checkoutStep === 1) {
                goToStep2();
            }
        });
    }

    // Place secure order final triggers
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const successModalOverlay = document.getElementById('success-modal-overlay');
    const successModal = document.getElementById('success-modal');
    const closeSuccessBtn = document.getElementById('close-success-modal');

    if (confirmPaymentBtn && successModal && successModalOverlay) {
        confirmPaymentBtn.addEventListener('click', () => {
            // Generate dynamic transaction ID
            const txId = "1PBUDS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            const name = document.getElementById('cust-name').value;
            const addr = document.getElementById('cust-address').value;
            
            // Collect colors list
            const uniqueColors = State.cart.map(item => ColorPalette[item.color].name).join(', ');
            
            // Pop success HUD variables
            document.getElementById('success-tx-id').textContent = txId;
            document.getElementById('success-address').textContent = `${name}, ${addr.substring(0, 20)}...`;
            document.getElementById('success-color').textContent = uniqueColors;
            
            // Open modal
            successModalOverlay.classList.add('active');
            successModal.classList.add('active');
        });

        // Close success modal return and reset cart
        const resetSite = () => {
            successModalOverlay.classList.remove('active');
            successModal.classList.remove('active');
            
            // Empty state cart
            State.cart = [];
            State.couponApplied = false;
            
            // Unlock fields
            if (couponInput) {
                couponInput.value = '';
                couponInput.disabled = false;
                couponMsg.textContent = '';
            }
            if (applyCouponBtn) applyCouponBtn.disabled = false;
            
            // Reset checkout coordinates forms
            if (addressForm) addressForm.reset();
            
            // Return to step 1
            if (stepLbl1) {
                stepLbl1.className = "step-circle active-step";
                stepLine.className = "step-line";
                stepLbl2.className = "step-circle";
            }
            if (paymentPanel) paymentPanel.classList.add('hidden');
            if (addressForm) addressForm.classList.remove('hidden');
            
            updateCartUI();
            closeCartDrawer();
        };

        if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', resetSite);
        if (successModalOverlay) successModalOverlay.addEventListener('click', resetSite);
    }

    // ==========================================================================
    // 10. Reviews Testimonials Auto-sliding slider
    // ==========================================================================
    const initReviewsSlider = () => {
        const track = document.getElementById('reviews-track');
        const dots = document.querySelectorAll('.slide-dot');
        const arrowLeft = document.getElementById('slide-left');
        const arrowRight = document.getElementById('slide-right');
        if (!track || !dots) return;
        
        const updateSlider = (index) => {
            State.reviewsIndex = index;
            
            // Scroll slide track
            track.style.transform = `translateX(-${index * 100}%)`;
            
            // Highlight indicators
            dots.forEach(d => d.classList.remove('active-dot'));
            const currentDot = document.querySelector(`.slide-dot[data-index="${index}"]`);
            if (currentDot) currentDot.classList.add('active-dot');
        };
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-index'));
                updateSlider(idx);
            });
        });
        
        if (arrowLeft && arrowRight) {
            arrowLeft.addEventListener('click', () => {
                let idx = State.reviewsIndex - 1;
                if (idx < 0) idx = dots.length - 1;
                updateSlider(idx);
            });
            arrowRight.addEventListener('click', () => {
                let idx = State.reviewsIndex + 1;
                if (idx >= dots.length) idx = 0;
                updateSlider(idx);
            });
        }
        
        // Auto rotate testimonials reviews every 8 seconds
        setInterval(() => {
            let idx = State.reviewsIndex + 1;
            if (idx >= dots.length) idx = 0;
            updateSlider(idx);
        }, 8000);
    };

    // ==========================================================================
    // 11. Secondary Forms & Overlay triggers (Support contact, Newsletter, Mobile)
    // ==========================================================================
    const initSupportModal = () => {
        const overlay = document.getElementById('contact-modal-overlay');
        const modal = document.getElementById('contact-modal');
        const triggers = document.querySelectorAll('#contact-trigger');
        const closeBtn = document.getElementById('contact-modal-close');
        const form = document.getElementById('contact-support-form');
        
        if (overlay && modal && closeBtn) {
            const openModal = (e) => {
                e.preventDefault();
                overlay.classList.add('active');
                modal.classList.add('active');
            };
            
            const closeModal = () => {
                overlay.classList.remove('active');
                modal.classList.remove('active');
            };
            
            triggers.forEach(t => t.addEventListener('click', openModal));
            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);
            
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert("Sync completed! Support signal transmitted successfully.");
                    closeModal();
                    form.reset();
                });
            }
        }
    };

    // Mobile Navigation Drawer Controllers
    const initMobileMenu = () => {
        const btnOpen = document.getElementById('mobile-menu-btn');
        const btnClose = document.getElementById('drawer-close');
        const drawer = document.getElementById('mobile-drawer');
        const links = document.querySelectorAll('.drawer-link');
        
        if (btnOpen && btnClose && drawer) {
            btnOpen.addEventListener('click', () => drawer.classList.add('open'));
            btnClose.addEventListener('click', () => drawer.classList.remove('open'));
            
            links.forEach(l => {
                l.addEventListener('click', () => drawer.classList.remove('open'));
            });
        }
    };

    // Footer Newsletter HUD message
    const initNewsletter = () => {
        const form = document.getElementById('newsletter-form');
        const hud = document.getElementById('newsletter-hud');
        if (form && hud) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                hud.textContent = "FREQUENCY SECURED. TERMINAL REGISTERED!";
                form.reset();
                setTimeout(() => hud.textContent = '', 4000);
            });
        }
    };

    // Navbar scroll-glow reactions
    const initNavbarScroll = () => {
        const nav = document.getElementById('navbar');
        if (!nav) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    };

    // ==========================================================================
    // 12. GSAP & ScrollTrigger Premium Animation Suite
    // ==========================================================================
    const triggerEntranceAnimations = () => {
        if (typeof gsap === 'undefined') return;
        
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Hero entrances
        gsap.from('.hero-title', {
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: 'power4.out',
            delay: 0.2
        });

        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power3.out',
            delay: 0.5
        });

        gsap.from('.hero-actions', {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'power3.out',
            delay: 0.7
        });

        gsap.from('.hero-specs-brief', {
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 0.9
        });
        
        gsap.from('.hero-interactive-canvas', {
            opacity: 0,
            scale: 0.85,
            duration: 1.5,
            ease: 'power4.out',
            delay: 0.4
        });

        // Scroll Animations - Features Cards
        gsap.utils.toArray('.feature-card').forEach((card) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Scroll Animations - Showcase panel transitions
        gsap.from('.showcase-control-panel', {
            scrollTrigger: {
                trigger: '.showcase-interactive-grid',
                start: 'top 80%'
            },
            opacity: 0,
            x: -60,
            duration: 1.2,
            ease: 'power3.out'
        });

        gsap.from('.showcase-canvas-panel', {
            scrollTrigger: {
                trigger: '.showcase-interactive-grid',
                start: 'top 80%'
            },
            opacity: 0,
            x: 60,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Scroll Animations - Purchase panel triggers
        gsap.from('.purchase-container', {
            scrollTrigger: {
                trigger: '.purchase-section',
                start: 'top 75%'
            },
            opacity: 0,
            y: 80,
            duration: 1.4,
            ease: 'power4.out'
        });

        // Dynamic 3D model rotation linked to scroll!
        gsap.to(heroBudGroup.rotation, {
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.2
            },
            z: Math.PI / 2,
            y: Math.PI * 1.5,
            x: -Math.PI / 4
        });

        // Battery level count animation triggered on entering viewport
        const batteryFill = document.getElementById('battery-fill');
        const batteryHudNum = document.getElementById('battery-num-hud');
        
        if (batteryFill && batteryHudNum) {
            ScrollTrigger.create({
                trigger: '#battery-card',
                start: 'top 80%',
                onEnter: () => {
                    // Trigger battery animation
                    let pct = 15;
                    const fillInterval = setInterval(() => {
                        pct += 5;
                        if (pct >= 100) {
                            pct = 100;
                            clearInterval(fillInterval);
                            document.getElementById('battery-status-text').textContent = "BATTERY STATUS SECURED";
                        }
                        batteryFill.style.width = `${pct}%`;
                        batteryHudNum.textContent = `${pct}%`;
                    }, 50);
                }
            });
        }
    };

    // ==========================================================================
    // 13. System Initializer Call
    // ==========================================================================
    const initSystem = () => {
        // Run Cinematic Loading screen
        runLoader();
        
        // Interactive cursor glow
        initCursorGlow();
        
        // Background particles canvas setup
        initBackgroundParticles();
        
        // Build both Three.js scenes
        initHero3D();
        initShowcase3D();
        
        // Interactive Technical panels
        initANCWaveform();
        initSpatialRadar();
        initTouchGestures();
        
        // E-commerce interactions setup
        setupColorPickers();
        setupQtyControllers();
        updateCartUI();
        
        // Review slide components
        initReviewsSlider();
        
        // Other support systems
        initSupportModal();
        initMobileMenu();
        initNewsletter();
        initNavbarScroll();
    };

    // Fire Up the soundstage
    initSystem();
});
